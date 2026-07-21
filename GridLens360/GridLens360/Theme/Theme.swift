//
//  Theme.swift
//  GridLens 360
//
//  The boardroom design system. One source of truth for colour, type, depth and
//  motion so every surface reads as one instrument. Tuned dark-first for a
//  control-room / boardroom projector and for glance-legibility on iPhone.
//

import SwiftUI

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(.sRGB,
                  red: Double((hex >> 16) & 0xFF) / 255,
                  green: Double((hex >> 8) & 0xFF) / 255,
                  blue: Double(hex & 0xFF) / 255,
                  opacity: alpha)
    }
}

enum Theme {

    // MARK: Palette
    static let bg          = Color(hex: 0x070B12)   // deep operations black-navy
    static let bgElevated  = Color(hex: 0x0C121D)
    static let surface     = Color(hex: 0x121A28)   // card fill
    static let surfaceHi   = Color(hex: 0x182233)
    static let hairline    = Color(hex: 0x243247)
    static let hairlineSoft = Color(hex: 0x1A2434)

    static let textPrimary   = Color(hex: 0xF2F6FC)
    static let textSecondary = Color(hex: 0x9BA9C2)
    static let textTertiary  = Color(hex: 0x5F6E88)

    static let energy   = Color(hex: 0x2FE3C4)   // live / primary accent (teal)
    static let energyDim = Color(hex: 0x1C8C7C)
    static let export   = Color(hex: 0x35DD8A)   // outbound / healthy green
    static let importIn = Color(hex: 0x4EA8FF)   // inbound blue
    static let amber    = Color(hex: 0xF5B841)   // reserve / neutral attention
    static let magenta  = Color(hex: 0xC46BFF)   // renewables accent
    static let reportGrey = Color(hex: 0x8792A6) // Grid-Report basis (magnitude-only)

    // MARK: Gradients
    static let screenBackground = LinearGradient(
        colors: [Color(hex: 0x080D16), Color(hex: 0x05080E)],
        startPoint: .top, endPoint: .bottom)

    static let energyGrad = LinearGradient(
        colors: [energy, Color(hex: 0x1FB9E8)], startPoint: .leading, endPoint: .trailing)

    static func haloGrad(_ c: Color) -> RadialGradient {
        RadialGradient(colors: [c.opacity(0.32), .clear], center: .center,
                       startRadius: 1, endRadius: 140)
    }

    // MARK: Type — large tabular numerals for KPIs
    static func number(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded).monospacedDigit()
    }
    static let heroNumber = number(46, weight: .heavy)
    static let bigNumber  = number(30, weight: .bold)
    static let label      = Font.system(size: 11, weight: .semibold).width(.expanded)
    static let caption    = Font.system(size: 10.5, weight: .medium)
    static let sectionTitle = Font.system(size: 13, weight: .bold).width(.expanded)

    // MARK: Depth
    static let cardCorner: CGFloat = 18
    static let cardStroke = LinearGradient(
        colors: [Color.white.opacity(0.08), Color.white.opacity(0.02)],
        startPoint: .topLeading, endPoint: .bottomTrailing)

    // MARK: Motion tokens
    static let flowPeriod: Double = 2.2         // corridor dash travel
    static let countUp: Double = 1.1            // KPI count-up
    static let ambient = Animation.easeInOut(duration: 3.4).repeatForever(autoreverses: true)
    static let spring = Animation.spring(response: 0.5, dampingFraction: 0.82)

    /// Semantic colour for a flow value: green outbound, blue inbound, grey no-feed.
    static func flowColor(_ mw: Double, hasFeed: Bool = true) -> Color {
        guard hasFeed else { return reportGrey }
        return mw >= 0 ? export : importIn
    }
}

/// The signature card container used across every board.
struct BoardCard<Content: View>: View {
    var padding: CGFloat = 16
    @ViewBuilder var content: () -> Content
    var body: some View {
        content()
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .fill(Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .strokeBorder(Theme.cardStroke, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.35), radius: 14, x: 0, y: 8)
    }
}

extension View {
    /// Standard board card wrapper.
    func boardCard(padding: CGFloat = 16) -> some View {
        BoardCard(padding: padding) { self }
    }
}
