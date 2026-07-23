//
//  Flow.swift
//  GridLens 360
//
//  Animated power-flow visuals. A moving dash travels in the metered direction —
//  the sign of the MW decides which way it runs (BINDING LAW #2). Driven by
//  TimelineView so motion is frame-accurate and needs no animation state.
//

import SwiftUI

/// A horizontal flowing connector between two endpoint labels. Direction and
/// colour are derived from the signed value; no-feed corridors render grey/static.
struct FlowLine: View {
    let mw: Double
    var hasFeed: Bool = true
    var height: CGFloat = 26

    private var forward: Bool { mw >= 0 }
    private var color: Color { Theme.flowColor(mw, hasFeed: hasFeed) }

    var body: some View {
        let dash: CGFloat = 20
        TimelineView(.animation) { ctx in
            let t = ctx.date.timeIntervalSinceReferenceDate
            let travel = CGFloat((t.truncatingRemainder(dividingBy: Theme.flowPeriod)) / Theme.flowPeriod) * dash
            Canvas { g, size in
                let y = size.height / 2
                var base = Path()
                base.move(to: CGPoint(x: 0, y: y))
                base.addLine(to: CGPoint(x: size.width, y: y))
                g.stroke(base, with: .color(color.opacity(0.22)),
                         style: StrokeStyle(lineWidth: 3, lineCap: .round))
                if hasFeed {
                    g.stroke(base, with: .color(color),
                             style: StrokeStyle(lineWidth: 3, lineCap: .round,
                                                dash: [7, dash - 7],
                                                dashPhase: forward ? -travel : travel))
                    // Arrow head in the flow direction.
                    let ax = forward ? size.width : 0
                    let dir: CGFloat = forward ? -1 : 1
                    var head = Path()
                    head.move(to: CGPoint(x: ax + dir * 9, y: y - 5))
                    head.addLine(to: CGPoint(x: ax, y: y))
                    head.addLine(to: CGPoint(x: ax + dir * 9, y: y + 5))
                    g.stroke(head, with: .color(color),
                             style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
                }
            }
        }
        .frame(height: height)
    }
}

/// A node marker used in the Kingdom schematic.
struct AreaNode: View {
    let code: String
    let sub: String
    var accent: Color = Theme.energy
    var highlighted: Bool = false
    @State private var glow = false
    var body: some View {
        VStack(spacing: 2) {
            Text(code)
                .font(.system(size: 13, weight: .heavy))
                .foregroundStyle(Theme.textPrimary)
            Text(sub)
                .font(.system(size: 8.5, weight: .semibold))
                .foregroundStyle(Theme.textTertiary)
        }
        .padding(.horizontal, 11).padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 11, style: .continuous)
                .fill(Theme.surfaceHi)
                .overlay(RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .strokeBorder(accent.opacity(highlighted ? 0.9 : 0.4),
                                  lineWidth: highlighted ? 1.6 : 1)))
        .shadow(color: accent.opacity(highlighted && glow ? 0.6 : 0.15), radius: highlighted ? 10 : 4)
        .onAppear { if highlighted { withAnimation(Theme.ambient) { glow = true } } }
    }
}
