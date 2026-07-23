//
//  CommandView.swift
//  GridLens 360
//
//  The flagship board: four hero KPIs, the export/balance story, and the
//  operating-day curve — everything a C-level viewer needs at a glance.
//

import SwiftUI

struct CommandView: View {
    let grid: GridSnapshot

    var body: some View {
        Board(title: "Command",
              subtitle: "Eastern Operating Area at \(grid.asOf). Every figure carries its PI tag and reading time.",
              grid: grid) {

            // Hero KPI grid ---------------------------------------------------
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 12),
                                GridItem(.flexible(), spacing: 12)], spacing: 12) {
                HeroKPI(metric: grid.demand, accent: Theme.energy, glyph: "bolt.fill")
                FrequencyKPI(metric: grid.frequency)
                HeroKPI(metric: grid.generation, accent: Theme.export, glyph: "powerplug.fill")
                HeroKPI(metric: grid.gccExport, accent: Theme.importIn, glyph: "arrow.up.right")
            }

            // Export headline + balance proof --------------------------------
            BalanceCard(grid: grid)

            // Operating-day curve --------------------------------------------
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Operating Day", accent: Theme.amber,
                              trailing: "National · \(grid.reportBasis)")
                OperatingDayCurve(points: grid.operatingDayPoints,
                                  snapshotLabel: grid.asOf)
                HStack(spacing: 6) {
                    Image(systemName: "info.circle")
                        .font(.system(size: 9))
                        .foregroundStyle(Theme.textTertiary)
                    Text("Three measured points — national minimum, max-reserve, and peak. Not interpolated.")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Theme.textTertiary)
                }
            }
            .boardCard()

            // Footprint ribbon -----------------------------------------------
            FootprintRibbon(grid: grid)
        }
    }
}

// MARK: - Hero KPI tile

private struct HeroKPI: View {
    let metric: Metric
    let accent: Color
    let glyph: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: glyph)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(accent)
                    .frame(width: 26, height: 26)
                    .background(Circle().fill(accent.opacity(0.14)))
                Spacer()
                Text(metric.unit)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Theme.textTertiary)
            }
            Text(metric.label.uppercased())
                .font(.system(size: 9.5, weight: .semibold))
                .tracking(0.6)
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1).minimumScaleFactor(0.6)
            CountUp(target: metric.value, font: Theme.number(30, weight: .heavy), color: accent)
            TagChip(tag: metric.tag, timestamp: metric.timestamp, isPITag: metric.isPITag)
        }
        .frame(maxWidth: .infinity, minHeight: 132, alignment: .leading)
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .fill(Theme.surface)
                .overlay(Theme.haloGrad(accent).clipShape(
                    RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)))
        )
        .overlay(RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
            .strokeBorder(Theme.cardStroke, lineWidth: 1))
        .shadow(color: .black.opacity(0.35), radius: 12, y: 6)
    }
}

private struct FrequencyKPI: View {
    let metric: Metric
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "waveform.path.ecg")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Theme.energy)
                    .frame(width: 26, height: 26)
                    .background(Circle().fill(Theme.energy.opacity(0.14)))
                Spacer()
                Text("Hz").font(.system(size: 10, weight: .bold)).foregroundStyle(Theme.textTertiary)
            }
            Text(metric.label.uppercased())
                .font(.system(size: 9.5, weight: .semibold)).tracking(0.6)
                .foregroundStyle(Theme.textSecondary).lineLimit(1).minimumScaleFactor(0.8)
            CountUp(target: metric.value, font: Theme.number(30, weight: .heavy),
                    color: Theme.energy, format: { String(format: "%.3f", $0) })
            FrequencyBand(value: metric.value)
            Text("Nominal 60.00 · \(metric.tag)")
                .font(.system(size: 8.5, weight: .medium))
                .foregroundStyle(Theme.textTertiary)
                .lineLimit(1).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, minHeight: 132, alignment: .leading)
        .padding(14)
        .background(RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
            .fill(Theme.surface)
            .overlay(Theme.haloGrad(Theme.energy).clipShape(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous))))
        .overlay(RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
            .strokeBorder(Theme.cardStroke, lineWidth: 1))
        .shadow(color: .black.opacity(0.35), radius: 12, y: 6)
    }
}

// MARK: - Balance / export story

private struct BalanceCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Power Balance", accent: Theme.export,
                          trailing: "Exporting")

            // The signed export headline with a live flow line.
            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("EASTERN → NATIONAL GRID")
                        .font(.system(size: 10, weight: .bold)).tracking(0.6)
                        .foregroundStyle(Theme.textSecondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        CountUp(target: grid.exportToNational.value,
                                font: Theme.number(34, weight: .heavy), color: Theme.export)
                        Text("MW").font(.system(size: 12, weight: .bold))
                            .foregroundStyle(Theme.textTertiary)
                    }
                }
                Spacer()
                DirectionPill(origin: "EOA", destination: "KSA", color: Theme.export)
            }
            FlowLine(mw: grid.exportToNational.value, height: 22)
            TagChip(tag: grid.exportToNational.tag, timestamp: grid.exportToNational.timestamp,
                    isPITag: grid.exportToNational.isPITag)

            Divider().overlay(Theme.hairlineSoft)

            // Arithmetic proof: gen − load ≈ export.
            HStack(spacing: 8) {
                proofTerm(grid.generation.display, "GENERATION", Theme.export)
                op("−")
                proofTerm(grid.demand.display, "DEMAND", Theme.energy)
                op("=")
                proofTerm(Metric.grouped(grid.balanceDelta), "NET", Theme.amber)
            }
            Text("Net generation \(Metric.grouped(grid.balanceDelta)) MW ≈ export headline \(grid.exportToNational.display) MW (rounding / losses band).")
                .font(.system(size: 10.5, weight: .medium))
                .foregroundStyle(Theme.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .boardCard()
    }

    private func proofTerm(_ v: String, _ label: String, _ color: Color) -> some View {
        VStack(spacing: 3) {
            Text(v).font(Theme.number(17, weight: .bold)).foregroundStyle(color)
            Text(label).font(.system(size: 8, weight: .semibold)).tracking(0.5)
                .foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))
    }
    private func op(_ s: String) -> some View {
        Text(s).font(.system(size: 16, weight: .heavy)).foregroundStyle(Theme.textTertiary)
    }
}

// MARK: - Footprint ribbon

private struct FootprintRibbon: View {
    let grid: GridSnapshot
    var body: some View {
        HStack(spacing: 10) {
            footChip("\(grid.stationCount)", "STATIONS")
            footChip(Metric.grouped(Double(grid.signalsParsed)), "SIGNALS")
            footChip(Metric.grouped(grid.spinningReserve.value), "SPIN MW")
            footChip("\(grid.peakMinute)", "PEAK MIN")
        }
    }
    private func footChip(_ v: String, _ l: String) -> some View {
        VStack(spacing: 3) {
            Text(v).font(Theme.number(16, weight: .bold)).foregroundStyle(Theme.textPrimary)
            Text(l).font(.system(size: 8, weight: .semibold)).tracking(0.6)
                .foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 14).fill(Theme.surface))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Theme.hairlineSoft, lineWidth: 1))
    }
}
