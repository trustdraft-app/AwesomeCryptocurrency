//
//  CountUpNumber.swift
//  GridLens 360
//
//  A number that ramps from 0 to its real value on appear. Implemented as an
//  Animatable View so SwiftUI interpolates the intermediate digits — the
//  boardroom "power-on" feel without any fabricated data.
//

import SwiftUI

struct CountUpNumber: View, Animatable {
    var value: Double
    var font: Font
    var color: Color = Theme.textPrimary
    /// Formatting hook so callers control decimals/grouping.
    var format: (Double) -> String = { Metric.grouped($0) }

    var animatableData: Double {
        get { value }
        set { value = newValue }
    }

    var body: some View {
        Text(format(value))
            .font(font)
            .foregroundStyle(color)
            .contentTransition(.numericText())
    }
}

/// Drives a CountUpNumber from 0 → target once, on first appearance.
struct CountUp: View {
    let target: Double
    var font: Font = Theme.heroNumber
    var color: Color = Theme.textPrimary
    var format: (Double) -> String = { Metric.grouped($0) }
    @State private var shown: Double = 0

    var body: some View {
        CountUpNumber(value: shown, font: font, color: color, format: format)
            .onAppear {
                shown = 0
                withAnimation(.easeOut(duration: Theme.countUp)) { shown = target }
            }
    }
}
