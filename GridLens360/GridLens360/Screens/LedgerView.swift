//
//  LedgerView.swift
//  GridLens 360
//
//  The honesty ledger: the numbers auditing themselves (every headline sum
//  re-derived from its parts, in-app), the provenance limits, the census, and
//  the About / credits card.
//

import SwiftUI

struct LedgerView: View {
    let grid: GridSnapshot

    var body: some View {
        Board(title: "Ledger",
              subtitle: "The numbers audit themselves. Every headline below is re-derived from its parts in code, live in this view.",
              grid: grid) {

            SelfCheckCard(grid: grid)
            CensusCard(grid: grid)
            LimitsCard(grid: grid)
            AboutCard(grid: grid)
        }
    }
}

private struct SelfCheckCard: View {
    let grid: GridSnapshot
    var body: some View {
        let checks = grid.selfCheck()
        let passed = checks.filter { $0.ok }.count
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SectionHeader(title: "Numbers Audit", accent: Theme.export)
                Spacer()
                Text("\(passed)/\(checks.count)")
                    .font(Theme.number(15, weight: .heavy))
                    .foregroundStyle(passed == checks.count ? Theme.export : Theme.amber)
            }
            ForEach(checks.indices, id: \.self) { i in
                let c = checks[i]
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: c.ok ? "checkmark.seal.fill" : "xmark.seal.fill")
                        .font(.system(size: 13)).foregroundStyle(c.ok ? Theme.export : Theme.amber)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(c.name).font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Theme.textPrimary)
                        Text(c.detail).font(.system(size: 10.5, weight: .medium, design: .monospaced))
                            .foregroundStyle(Theme.textTertiary)
                    }
                    Spacer()
                }
                .padding(.vertical, 6)
                if i < checks.count - 1 { Divider().overlay(Theme.hairlineSoft) }
            }
        }
        .boardCard()
    }
}

private struct CensusCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Telemetry Census", accent: Theme.energy)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                mini("\(grid.stationCount)", "STATIONS")
                mini(Metric.grouped(Double(grid.signalsParsed)), "SIGNALS PARSED")
                mini(Metric.grouped(Double(grid.censusNumeric)), "LIVE NUMERIC")
                mini(Metric.grouped(Double(grid.censusDigital)), "LIVE DIGITAL")
            }
            Text("Two honest countings: \(Metric.grouped(Double(grid.signalsParsed))) parsed signal rows in this bake vs a forensic census of \(Metric.grouped(Double(grid.censusNumeric))) numeric + \(Metric.grouped(Double(grid.censusDigital))) digital + \(grid.censusPlaceholder) placeholders (peak minute \(grid.peakMinute)). They are labelled, never forced equal.")
                .font(.system(size: 10, weight: .medium)).foregroundStyle(Theme.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 10) {
                coordChip("\(grid.coordReal)", "REAL", Theme.export)
                coordChip("\(grid.coordEstimate)", "ESTIMATE", Theme.amber)
                coordChip("\(grid.coordOffMap)", "OFF-MAP", Theme.reportGrey)
            }
        }
        .boardCard()
    }
    private func mini(_ v: String, _ l: String) -> some View {
        VStack(spacing: 3) {
            Text(v).font(Theme.number(20, weight: .bold)).foregroundStyle(Theme.textPrimary)
            Text(l).font(.system(size: 8.5, weight: .semibold)).tracking(0.6).foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Theme.bgElevated))
    }
    private func coordChip(_ v: String, _ l: String, _ c: Color) -> some View {
        HStack(spacing: 5) {
            Circle().fill(c).frame(width: 7, height: 7)
            Text(v).font(Theme.number(12, weight: .bold)).foregroundStyle(Theme.textPrimary)
            Text(l).font(.system(size: 8.5, weight: .semibold)).foregroundStyle(Theme.textTertiary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 8)
        .background(Capsule().fill(Theme.bgElevated))
    }
}

private struct LimitsCard: View {
    let grid: GridSnapshot
    private let limits = [
        "Frozen snapshot 12 Jul 2026 unless a PI feed runs — the header says so and flips to LIVE only when fed.",
        "Coordinates: 401 real / 112 labelled estimates / 15 off-map. Defective registry strings are placed by estimate, never faked.",
        "The full EOA↔Central boundary is 1,141.5 MW (SYS_CALC:EOA_COA_ICHG) and is not in this snapshot; the 2,033 total + basis note carry the honesty meanwhile.",
        "GCC 812 (HVDC total) and 821.25 (converter Σ) are two real tags/windows — never averaged.",
        "Remote GCC nodes last reported 2025-09-16 are shown stale, never invented."
    ]
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Honest Limits", accent: Theme.amber)
            ForEach(limits.indices, id: \.self) { i in
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "shield.lefthalf.filled")
                        .font(.system(size: 10)).foregroundStyle(Theme.amber.opacity(0.85))
                    Text(limits[i]).font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .boardCard()
    }
}

private struct AboutCard: View {
    let grid: GridSnapshot
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "About", accent: Theme.energy)
            row("Product", "GridLens 360 · Real-Time Grid Intelligence")
            row("Scope", "SEC Eastern Operating Area transmission grid")
            row("Basis", "Frozen PI-System snapshot · 12 Jul 2026 · \(grid.window)")
            row("Owner", grid.owner)
            row("Team", grid.team)
            row("Unit", grid.unitName)
            row("Version", "\(grid.appVersion) (\(grid.appBuild))")
            Text("Telemetry-framed, English only. Every displayed number carries a PI tag and a timestamp. No value is invented, interpolated, or averaged across windows.")
                .font(.system(size: 10.5, weight: .medium)).foregroundStyle(Theme.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 4)
        }
        .boardCard()
    }
    private func row(_ k: String, _ v: String) -> some View {
        HStack(alignment: .top) {
            Text(k.uppercased()).font(.system(size: 9.5, weight: .bold)).tracking(0.6)
                .foregroundStyle(Theme.textTertiary).frame(width: 74, alignment: .leading)
            Text(v).font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }
}
