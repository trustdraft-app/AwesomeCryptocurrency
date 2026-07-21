//
//  CorridorsView.swift
//  GridLens 360
//
//  Tie boundaries: where Eastern power leaves and enters. Direction is computed
//  from the signed MW at render (BINDING LAW #2); each card shows its metered
//  legs, its tag, and any partial-vs-boundary basis note.
//

import SwiftUI

struct CorridorsView: View {
    let grid: GridSnapshot
    @State private var expanded: Set<String> = []

    var body: some View {
        Board(title: "Corridors",
              subtitle: "Signed net interchange across each boundary. Arrows follow the metered sign — corridors without a live feed never show an outage claim.",
              grid: grid) {

            // Summary strip of the three boundary totals.
            HStack(spacing: 10) {
                boundaryChip("2,033", "→ NATIONAL", Theme.export)
                boundaryChip("812", "→ GCC", Theme.importIn)
                boundaryChip("726", "→ CENTRAL", Theme.energy)
            }

            ForEach(grid.corridors) { c in
                CorridorCard(corridor: c,
                             isOpen: expanded.contains(c.id.uuidString),
                             toggle: { toggle(c) })
            }
        }
    }

    private func toggle(_ c: Corridor) {
        let k = c.id.uuidString
        withAnimation(Theme.spring) {
            if expanded.contains(k) { expanded.remove(k) } else { expanded.insert(k) }
        }
    }

    private func boundaryChip(_ v: String, _ l: String, _ color: Color) -> some View {
        VStack(spacing: 3) {
            Text(v).font(Theme.number(18, weight: .heavy)).foregroundStyle(color)
            Text(l).font(.system(size: 8.5, weight: .bold)).tracking(0.5)
                .foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 14).fill(Theme.surface))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(color.opacity(0.25), lineWidth: 1))
    }
}

private struct CorridorCard: View {
    let corridor: Corridor
    let isOpen: Bool
    let toggle: () -> Void

    private var color: Color { Theme.flowColor(corridor.net) }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                DirectionPill(origin: corridor.origin, destination: corridor.destination, color: color)
                Spacer()
                HStack(alignment: .firstTextBaseline, spacing: 3) {
                    Text(Metric.grouped(corridor.magnitude))
                        .font(Theme.number(26, weight: .heavy)).foregroundStyle(color)
                    Text("MW").font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.textTertiary)
                }
            }

            FlowLine(mw: corridor.net, height: 20)

            TagChip(tag: corridor.tag, timestamp: corridor.timestamp)

            if let note = corridor.note {
                HStack(alignment: .top, spacing: 6) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 9)).foregroundStyle(Theme.amber.opacity(0.9))
                    Text(note)
                        .font(.system(size: 10.5, weight: .medium))
                        .foregroundStyle(Theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(10)
                .background(RoundedRectangle(cornerRadius: 10).fill(Theme.amber.opacity(0.07)))
            }

            let legs = corridor.visibleLegs
            if !legs.isEmpty {
                Button(action: toggle) {
                    HStack(spacing: 6) {
                        Image(systemName: isOpen ? "chevron.down" : "chevron.right")
                            .font(.system(size: 9, weight: .bold))
                        Text(isOpen ? "Hide metered legs" : "Show \(legs.count) metered legs")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundStyle(color)
                }
                if isOpen {
                    VStack(spacing: 0) {
                        ForEach(legs) { leg in
                            LegRow(leg: leg)
                            if leg.id != legs.last?.id {
                                Divider().overlay(Theme.hairlineSoft)
                            }
                        }
                    }
                    .padding(.top, 2)
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
        }
        .boardCard()
    }
}

private struct LegRow: View {
    let leg: CorridorLeg
    private var color: Color { leg.mw >= 0 ? Theme.export : Theme.importIn }
    var body: some View {
        HStack {
            Image(systemName: leg.mw >= 0 ? "arrow.up.right" : "arrow.down.left")
                .font(.system(size: 9, weight: .bold)).foregroundStyle(color)
                .frame(width: 16)
            Text(leg.name)
                .font(.system(size: 12, weight: .semibold, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
            Spacer()
            Text("\(leg.mw >= 0 ? "+" : "")\(Metric.grouped(leg.mw))")
                .font(Theme.number(13, weight: .bold)).foregroundStyle(color)
            Text("MW").font(.system(size: 9, weight: .medium)).foregroundStyle(Theme.textTertiary)
        }
        .padding(.vertical, 8)
    }
}
