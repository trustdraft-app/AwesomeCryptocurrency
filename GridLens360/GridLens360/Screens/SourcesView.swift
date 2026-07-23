//
//  SourcesView.swift
//  GridLens 360
//
//  Renewables, battery, and the partner data-exchange lanes. Two honest
//  renewable countings are labelled and never forced equal.
//

import SwiftUI

struct SourcesView: View {
    let grid: GridSnapshot

    var body: some View {
        Board(title: "Sources",
              subtitle: "Renewables, battery storage, and the Aramco / GCCIA data-exchange interfaces.",
              grid: grid) {

            RenewablesCard(grid: grid)
            BatteryCard(grid: grid)
            ExchangeCard(grid: grid)
        }
    }
}

private struct RenewablesCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Renewables", accent: Theme.magenta,
                          trailing: "\(grid.renPlantCount) plants")

            HStack(alignment: .center, spacing: 16) {
                RingGauge(fraction: grid.renNationalPct / 100,
                          color: Theme.magenta,
                          centerTop: String(format: "%.1f%%", grid.renNationalPct),
                          centerBottom: "of peak")
                    .frame(width: 110, height: 110)
                VStack(alignment: .leading, spacing: 6) {
                    Text("NATIONAL RENEWABLES")
                        .font(.system(size: 10, weight: .bold)).tracking(0.6)
                        .foregroundStyle(Theme.textSecondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        CountUp(target: grid.renNationalTotal.value,
                                font: Theme.number(30, weight: .heavy), color: Theme.magenta)
                        Text("MW").font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.textTertiary)
                    }
                    Text("Σ of 20 plants — exact")
                        .font(.system(size: 10, weight: .medium)).foregroundStyle(Theme.textTertiary)
                    TagChip(tag: grid.renNationalTotal.tag, isPITag: grid.renNationalTotal.isPITag)
                    StatusStamp(basis: grid.renNationalTotal.basis)
                }
                Spacer(minLength: 0)
            }

            Divider().overlay(Theme.hairlineSoft)

            // Eastern renewables — two honest countings.
            Text("EASTERN — \(grid.renEOATotal.display) MW  ·  four renewable rings")
                .font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.textSecondary)
            HStack(spacing: 10) {
                splitTile(grid.renEOAWind, "WIND", "wind", Theme.energy)
                splitTile(grid.renEOAPV, "SOLAR PV", "sun.max.fill", Theme.amber)
            }
            Text("Wind and PV are a generation-type split. The eastern total is \(grid.renEOATotal.display) MW across four renewable rings whose one-decimal terms foot to 675.0 (a 0.1 rounding artefact). The two countings are labelled, never forced equal.")
                .font(.system(size: 10, weight: .medium)).foregroundStyle(Theme.textTertiary)
                .fixedSize(horizontal: false, vertical: true)

            ForEach(grid.renNamedAssets) { asset in
                HStack {
                    Image(systemName: "circle.hexagongrid.fill")
                        .font(.system(size: 10)).foregroundStyle(Theme.magenta.opacity(0.8))
                    Text(asset.name).font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Text("\(Metric.grouped(asset.value)) \(asset.unit)")
                        .font(Theme.number(13, weight: .bold)).foregroundStyle(Theme.textPrimary)
                }
                .padding(.vertical, 6)
            }
        }
        .boardCard()
    }

    private func splitTile(_ m: Metric, _ label: String, _ glyph: String, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: glyph).font(.system(size: 11)).foregroundStyle(color)
                Text(label).font(.system(size: 9.5, weight: .bold)).tracking(0.6)
                    .foregroundStyle(Theme.textTertiary)
            }
            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text(m.display).font(Theme.number(20, weight: .heavy)).foregroundStyle(color)
                Text("MW").font(.system(size: 9, weight: .medium)).foregroundStyle(Theme.textTertiary)
            }
            TagChip(tag: m.tag, timestamp: m.timestamp, isPITag: m.isPITag)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))
    }
}

private struct BatteryCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Battery Storage", accent: Theme.export,
                          trailing: "\(grid.bessSiteCount) sites")
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("EASTERN NET").font(.system(size: 9.5, weight: .bold)).tracking(0.6)
                        .foregroundStyle(Theme.textTertiary)
                    HStack(alignment: .firstTextBaseline, spacing: 3) {
                        Text(grid.bessEOA.display).font(Theme.number(24, weight: .heavy))
                            .foregroundStyle(Theme.importIn)
                        Text("MW").font(.system(size: 10, weight: .bold)).foregroundStyle(Theme.textTertiary)
                    }
                    Text("Net negative — fleet charging")
                        .font(.system(size: 9.5, weight: .medium)).foregroundStyle(Theme.textTertiary)
                    TagChip(tag: grid.bessEOA.tag, timestamp: grid.bessEOA.timestamp, isPITag: grid.bessEOA.isPITag)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12).background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))

                VStack(alignment: .leading, spacing: 4) {
                    Text("NATIONAL FLEET").font(.system(size: 9.5, weight: .bold)).tracking(0.6)
                        .foregroundStyle(Theme.textTertiary)
                    HStack(alignment: .firstTextBaseline, spacing: 3) {
                        CountUp(target: grid.bessKSAFleet.value,
                                font: Theme.number(24, weight: .heavy), color: Theme.export)
                        Text("MW").font(.system(size: 10, weight: .bold)).foregroundStyle(Theme.textTertiary)
                    }
                    Text("KSA installed capacity")
                        .font(.system(size: 9.5, weight: .medium)).foregroundStyle(Theme.textTertiary)
                    StatusStamp(basis: grid.bessKSAFleet.basis)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12).background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))
            }
        }
        .boardCard()
    }
}

private struct ExchangeCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Data Exchange", accent: Theme.importIn,
                          trailing: "Interface points")
            ForEach(grid.exchangeLanes) { lane in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        DirectionPill(origin: lane.from, destination: lane.to, color: Theme.importIn)
                        Spacer()
                        HStack(alignment: .firstTextBaseline, spacing: 3) {
                            Text(Metric.grouped(Double(lane.points)))
                                .font(Theme.number(18, weight: .heavy)).foregroundStyle(Theme.textPrimary)
                            Text("pts").font(.system(size: 10, weight: .medium)).foregroundStyle(Theme.textTertiary)
                        }
                    }
                    FlowLine(mw: 1, height: 14)
                    HStack {
                        TagChip(tag: "reconciled to partner workbook", isPITag: false)
                        Spacer()
                        if let h = lane.health {
                            HStack(spacing: 4) {
                                Circle().fill(Theme.amber).frame(width: 6, height: 6)
                                Text("\(h) health flags").font(.system(size: 9.5, weight: .medium))
                                    .foregroundStyle(Theme.textTertiary)
                            }
                        }
                    }
                }
                .padding(.vertical, 8)
                if lane.id != grid.exchangeLanes.last?.id {
                    Divider().overlay(Theme.hairlineSoft)
                }
            }
        }
        .boardCard()
    }
}
