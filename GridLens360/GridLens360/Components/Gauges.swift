//
//  Gauges.swift
//  GridLens 360
//
//  Ring gauges and bar meters — the infographic vocabulary for shares, reserves
//  and area contributions. All animate their fill on appear.
//

import SwiftUI

/// Circular arc gauge with an animated sweep and a centred readout.
struct RingGauge: View {
    let fraction: Double            // 0…1
    var color: Color = Theme.energy
    var track: Color = Theme.hairline
    var lineWidth: CGFloat = 12
    var centerTop: String
    var centerBottom: String
    @State private var sweep: Double = 0

    var body: some View {
        ZStack {
            Circle()
                .stroke(track, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            Circle()
                .trim(from: 0, to: sweep)
                .stroke(
                    AngularGradient(colors: [color.opacity(0.55), color],
                                    center: .center),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .shadow(color: color.opacity(0.6), radius: 6)
            VStack(spacing: 1) {
                Text(centerTop)
                    .font(Theme.number(24, weight: .heavy))
                    .foregroundStyle(Theme.textPrimary)
                Text(centerBottom.uppercased())
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(0.8)
                    .foregroundStyle(Theme.textTertiary)
            }
        }
        .onAppear { withAnimation(.easeOut(duration: 1.1)) { sweep = max(0, min(1, fraction)) } }
    }
}

/// Horizontal proportional bar with an animated fill and label/value row.
struct BarMeter: View {
    let label: String
    let valueText: String
    let fraction: Double            // 0…1
    var color: Color = Theme.energy
    var sub: String? = nil
    @State private var grow: Double = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(label)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.textSecondary)
                if let sub {
                    Text(sub)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Theme.textTertiary)
                }
                Spacer()
                Text(valueText)
                    .font(Theme.number(14, weight: .bold))
                    .foregroundStyle(Theme.textPrimary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.bgElevated)
                    Capsule()
                        .fill(LinearGradient(colors: [color.opacity(0.7), color],
                                             startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * grow)
                        .shadow(color: color.opacity(0.5), radius: 4)
                }
            }
            .frame(height: 8)
        }
        .onAppear { withAnimation(.easeOut(duration: 0.9)) { grow = max(0, min(1, fraction)) } }
    }
}

/// A compact stat tile: big number, label, provenance chip.
struct StatTile: View {
    let value: String
    let unit: String
    let label: String
    var color: Color = Theme.textPrimary
    var tag: String? = nil
    var timestamp: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold))
                .tracking(0.8)
                .foregroundStyle(Theme.textTertiary)
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(value)
                    .font(Theme.number(24, weight: .heavy))
                    .foregroundStyle(color)
                Text(unit)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary)
            }
            if let tag {
                TagChip(tag: tag, timestamp: timestamp)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .boardCard()
    }
}
