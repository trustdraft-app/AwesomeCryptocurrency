//
//  Charts.swift
//  GridLens 360
//
//  The operating-day curve and the frequency band. Both plot ONLY measured
//  points — no interpolation is presented as data (BINDING LAW #1 / axis honesty).
//

import SwiftUI

/// National demand across the operating day, drawn through the three MEASURED
/// points (min → max-reserve → peak). The eastern snapshot moment is marked.
struct OperatingDayCurve: View {
    let points: [(t: String, mw: Double)]
    let snapshotLabel: String
    @State private var draw: CGFloat = 0

    var body: some View {
        let values = points.map { $0.mw }
        let lo = (values.min() ?? 0) * 0.985
        let hi = (values.max() ?? 1) * 1.01
        GeometryReader { geo in
            let w = geo.size.width, h = geo.size.height
            let n = max(points.count - 1, 1)
            func pt(_ i: Int) -> CGPoint {
                let x = w * CGFloat(i) / CGFloat(n)
                let norm = (points[i].mw - lo) / max(hi - lo, 1)
                return CGPoint(x: x, y: h - CGFloat(norm) * h)
            }
            ZStack {
                // Area fill under the curve.
                Path { p in
                    p.move(to: CGPoint(x: 0, y: h))
                    for i in points.indices { p.addLine(to: pt(i)) }
                    p.addLine(to: CGPoint(x: w, y: h))
                    p.closeSubpath()
                }
                .fill(LinearGradient(colors: [Theme.energy.opacity(0.28), .clear],
                                     startPoint: .top, endPoint: .bottom))
                .opacity(Double(draw))

                // The curve line, drawn on. Indices-based so an empty series can
                // never trip a `1..<0` range or an out-of-bounds `pt(0)`.
                Path { p in
                    guard let first = points.indices.first else { return }
                    p.move(to: pt(first))
                    for i in points.indices.dropFirst() { p.addLine(to: pt(i)) }
                }
                .trim(from: 0, to: draw)
                .stroke(Theme.energyGrad,
                        style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
                .shadow(color: Theme.energy.opacity(0.5), radius: 4)

                // Measured-point diamonds + labels.
                ForEach(points.indices, id: \.self) { i in
                    let p = pt(i)
                    Circle()
                        .fill(Theme.energy)
                        .frame(width: 8, height: 8)
                        .overlay(Circle().stroke(Theme.bg, lineWidth: 2))
                        .position(p)
                        .opacity(Double(draw))
                    VStack(spacing: 1) {
                        Text(Metric.grouped(points[i].mw))
                            .font(Theme.number(11, weight: .bold))
                            .foregroundStyle(Theme.textPrimary)
                        Text(points[i].t)
                            .font(.system(size: 8.5, weight: .medium))
                            .foregroundStyle(Theme.textTertiary)
                    }
                    .position(x: min(max(p.x, 26), w - 26), y: max(p.y - 20, 18))
                    .opacity(Double(draw))
                }
            }
        }
        .frame(height: 132)
        .onAppear { withAnimation(.easeInOut(duration: 1.2)) { draw = 1 } }
    }
}

/// Frequency shown honestly as a single reading against the 60.00 Hz nominal
/// band — no fabricated waveform. A soft indicator glides to the reading.
struct FrequencyBand: View {
    let value: Double        // 60.019
    let nominal: Double = 60.0
    let band: Double = 0.10  // ±0.10 Hz display window
    @State private var pos: CGFloat = 0.5

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let frac = CGFloat((value - (nominal - band)) / (2 * band))
            ZStack(alignment: .leading) {
                Capsule().fill(Theme.bgElevated).frame(height: 6)
                // Nominal marker at centre.
                Rectangle().fill(Theme.textTertiary.opacity(0.6))
                    .frame(width: 1.5, height: 14)
                    .position(x: w / 2, y: 7)
                // Reading marker.
                Circle()
                    .fill(Theme.energy)
                    .frame(width: 13, height: 13)
                    .shadow(color: Theme.energy, radius: 5)
                    .position(x: max(7, min(w - 7, w * pos)), y: 7)
            }
            .frame(height: 14)
            .onAppear {
                pos = 0.5
                withAnimation(.spring(response: 0.8, dampingFraction: 0.7)) {
                    pos = max(0, min(1, frac))
                }
            }
        }
        .frame(height: 14)
    }
}
