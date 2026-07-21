//
//  KingdomView.swift
//  GridLens 360
//
//  The national picture: a six-area schematic with animated inter-area flows,
//  the operating-day demand markers, area own-peaks, the +368 non-coincidence
//  proof, and the national reserve stack.
//

import SwiftUI

struct KingdomView: View {
    let grid: GridSnapshot

    var body: some View {
        Board(title: "Kingdom",
              subtitle: "Six operating areas and the GCC interconnection. Live sign-computed edges animate in the metered direction; report edges are magnitude-only.",
              grid: grid) {

            // Schematic -------------------------------------------------------
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "National Interchange", accent: Theme.energy,
                              trailing: "EOA snapshot 18:08")
                KingdomMap(grid: grid).frame(height: 300)
                legend
            }
            .boardCard()

            // National demand markers ----------------------------------------
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "National Demand", accent: Theme.amber,
                              trailing: "Grid-Report \(grid.reportBasis)")
                HStack(spacing: 10) {
                    demandMarker(grid.ksaMinDemand, "MINIMUM", Theme.importIn)
                    demandMarker(grid.ksaMaxReserve, "MAX RESERVE", Theme.energy)
                    demandMarker(grid.ksaPeak, "PEAK", Theme.export)
                }
            }
            .boardCard()

            // Area own-peaks + non-coincidence -------------------------------
            AreaPeaksCard(grid: grid)

            // Reserve stack ---------------------------------------------------
            ReserveCard(grid: grid)
        }
    }

    private var legend: some View {
        HStack(spacing: 14) {
            legendDot(Theme.export, "Export")
            legendDot(Theme.importIn, "Import")
            legendDot(Theme.reportGrey, "Report ⇄")
            Spacer()
        }
    }
    private func legendDot(_ c: Color, _ t: String) -> some View {
        HStack(spacing: 5) {
            Circle().fill(c).frame(width: 7, height: 7)
            Text(t).font(.system(size: 9.5, weight: .medium)).foregroundStyle(Theme.textTertiary)
        }
    }

    private func demandMarker(_ m: Metric, _ tag: String, _ color: Color) -> some View {
        VStack(spacing: 4) {
            Text(m.display).font(Theme.number(19, weight: .heavy)).foregroundStyle(color)
                .minimumScaleFactor(0.7).lineLimit(1)
            Text(tag).font(.system(size: 8, weight: .bold)).tracking(0.5)
                .foregroundStyle(Theme.textTertiary)
            Text(m.timestamp).font(.system(size: 8.5, weight: .medium, design: .monospaced))
                .foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))
    }
}

// MARK: - Animated schematic

private struct KingdomMap: View {
    let grid: GridSnapshot

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width, h = geo.size.height
            let gcc = CGPoint(x: 0.90 * w, y: 0.83 * h)
            ZStack {
                // Edges (drawn behind the nodes).
                FlowEdge(from: center("EOA", w, h), to: center("COA", w, h),
                         mw: 726, label: "726")
                FlowEdge(from: center("COA", w, h), to: center("NEA", w, h),
                         mw: 141, label: "141")
                FlowEdge(from: center("NWA", w, h), to: center("NEA", w, h),
                         mw: 76, label: "76")
                FlowEdge(from: center("EOA", w, h), to: gcc,
                         mw: 812, label: "812", accentInbound: true)

                // Area nodes.
                ForEach(grid.areaPeaks) { a in
                    AreaNode(code: a.code, sub: Metric.grouped(a.peak),
                             accent: a.code == "EOA" ? Theme.energy : Theme.textSecondary,
                             highlighted: a.code == "EOA")
                        .position(center(a.code, w, h))
                }
                // GCC interconnection node.
                VStack(spacing: 1) {
                    Text("GCC").font(.system(size: 12, weight: .heavy)).foregroundStyle(Theme.importIn)
                    Text("HVDC").font(.system(size: 7.5, weight: .semibold)).foregroundStyle(Theme.textTertiary)
                }
                .padding(.horizontal, 9).padding(.vertical, 6)
                .background(RoundedRectangle(cornerRadius: 10).fill(Theme.surfaceHi)
                    .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Theme.importIn.opacity(0.4), lineWidth: 1)))
                .position(gcc)
            }
        }
    }

    private func center(_ code: String, _ w: CGFloat, _ h: CGFloat) -> CGPoint {
        guard let a = grid.areaPeaks.first(where: { $0.code == code }) else {
            return CGPoint(x: w / 2, y: h / 2)
        }
        return CGPoint(x: a.x * w, y: a.y * h)
    }
}

/// An animated edge between two schematic nodes. Dash travels in the flow
/// direction; a mid-pill prints the MW magnitude.
private struct FlowEdge: View {
    let from: CGPoint
    let to: CGPoint
    let mw: Double
    let label: String
    var accentInbound: Bool = false

    private var color: Color { accentInbound ? Theme.importIn : Theme.flowColor(mw) }
    private var forward: Bool { mw >= 0 }

    var body: some View {
        let dash: CGFloat = 18
        ZStack {
            TimelineView(.animation) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let travel = CGFloat((t.truncatingRemainder(dividingBy: Theme.flowPeriod)) / Theme.flowPeriod) * dash
                Canvas { g, _ in
                    var p = Path()
                    p.move(to: from); p.addLine(to: to)
                    g.stroke(p, with: .color(color.opacity(0.20)),
                             style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    g.stroke(p, with: .color(color),
                             style: StrokeStyle(lineWidth: 3, lineCap: .round,
                                                dash: [6, dash - 6],
                                                dashPhase: forward ? -travel : travel))
                }
            }
            Text(label)
                .font(Theme.number(11, weight: .bold))
                .foregroundStyle(color)
                .padding(.horizontal, 6).padding(.vertical, 2)
                .background(Capsule().fill(Theme.bg))
                .overlay(Capsule().strokeBorder(color.opacity(0.4), lineWidth: 1))
                .position(x: (from.x + to.x) / 2, y: (from.y + to.y) / 2)
        }
    }
}

// MARK: - Area peaks + non-coincidence

private struct AreaPeaksCard: View {
    let grid: GridSnapshot
    var body: some View {
        let maxPeak = grid.areaPeaks.map(\.peak).max() ?? 1
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Area Own-Peaks", accent: Theme.energy,
                          trailing: "Non-coincident")
            ForEach(grid.areaPeaks) { a in
                BarMeter(label: "\(a.code) · \(a.name)",
                         valueText: "\(Metric.grouped(a.peak)) MW",
                         fraction: a.peak / maxPeak,
                         color: a.code == "EOA" ? Theme.energy : Theme.importIn)
            }
            Divider().overlay(Theme.hairlineSoft)
            HStack(spacing: 8) {
                proofTerm(Metric.grouped(grid.areaPeakSum), "Σ OWN-PEAKS", Theme.textPrimary)
                op("−")
                proofTerm(grid.ksaPeak.display, "NATIONAL PEAK", Theme.export)
                op("=")
                proofTerm("+\(Metric.grouped(grid.nonCoincidence))", "DIVERSITY", Theme.amber)
            }
            Text("Areas do not peak at the same instant — the +\(Metric.grouped(grid.nonCoincidence)) MW gap is the non-coincidence diversity, not a measurement error.")
                .font(.system(size: 10.5, weight: .medium)).foregroundStyle(Theme.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .boardCard()
    }
    private func proofTerm(_ v: String, _ l: String, _ c: Color) -> some View {
        VStack(spacing: 3) {
            Text(v).font(Theme.number(15, weight: .bold)).foregroundStyle(c)
            Text(l).font(.system(size: 7.5, weight: .semibold)).tracking(0.4).foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 9)
        .background(RoundedRectangle(cornerRadius: 11).fill(Theme.bgElevated))
    }
    private func op(_ s: String) -> some View {
        Text(s).font(.system(size: 14, weight: .heavy)).foregroundStyle(Theme.textTertiary)
    }
}

private struct ReserveCard: View {
    let grid: GridSnapshot
    var body: some View {
        let total = grid.reserveSpin.value + grid.reserveStandby.value + grid.reserveUnavail.value
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "National Reserve", accent: Theme.export,
                          trailing: "Grid-Report \(grid.reportBasis)")
            BarMeter(label: "Spinning", valueText: grid.reserveSpin.display + " MW",
                     fraction: grid.reserveSpin.value / total, color: Theme.export)
            BarMeter(label: "Standby", valueText: grid.reserveStandby.display + " MW",
                     fraction: grid.reserveStandby.value / total, color: Theme.energy)
            BarMeter(label: "Unavailable", valueText: grid.reserveUnavail.display + " MW",
                     fraction: grid.reserveUnavail.value / total, color: Theme.reportGrey)
        }
        .boardCard()
    }
}
