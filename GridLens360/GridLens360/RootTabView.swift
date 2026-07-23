//
//  RootTabView.swift
//  GridLens 360
//
//  The five-board instrument: Command, Corridors, Kingdom, Sources, Ledger.
//

import SwiftUI

struct RootTabView: View {
    private let grid = GridSnapshot.eoa
    @State private var selection = 0

    init() {
        // Dark, translucent tab bar tuned to the operations theme.
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Theme.bgElevated)
        appearance.shadowColor = UIColor(Theme.hairline)
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView(selection: $selection) {
            CommandView(grid: grid)
                .tabItem { Label("Command", systemImage: "gauge.open.with.lines.needle.33percent") }
                .tag(0)
            CorridorsView(grid: grid)
                .tabItem { Label("Corridors", systemImage: "arrow.left.arrow.right") }
                .tag(1)
            KingdomView(grid: grid)
                .tabItem { Label("Kingdom", systemImage: "map") }
                .tag(2)
            SourcesView(grid: grid)
                .tabItem { Label("Sources", systemImage: "leaf") }
                .tag(3)
            LedgerView(grid: grid)
                .tabItem { Label("Ledger", systemImage: "checkmark.seal") }
                .tag(4)
        }
        .tint(Theme.energy)
        .preferredColorScheme(.dark)
    }
}

/// Shared screen background + safe scroll container used by every board.
struct Board<Content: View>: View {
    let title: String
    let subtitle: String
    let grid: GridSnapshot
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack {
            Theme.screenBackground.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    BoardHeader(title: title, subtitle: subtitle, grid: grid)
                    content()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 28)
            }
        }
    }
}

/// The GridLens wordmark + provenance header shown at the top of each board.
struct BoardHeader: View {
    let title: String
    let subtitle: String
    let grid: GridSnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 10) {
                LensMark()
                VStack(alignment: .leading, spacing: 1) {
                    Text("GRIDLENS 360")
                        .font(.system(size: 17, weight: .heavy).width(.expanded))
                        .tracking(1.0)
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                    Text("Real-Time Grid Intelligence")
                        .font(.system(size: 10.5, weight: .medium))
                        .tracking(0.4)
                        .foregroundStyle(Theme.textTertiary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                .layoutPriority(1)
                Spacer(minLength: 6)
                StatusStamp(basis: grid.status, timestamp: grid.asOf)
            }
            HStack(spacing: 8) {
                Text(title.uppercased())
                    .font(.system(size: 24, weight: .heavy))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Text("EOA · \(grid.snapshotDate)")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textTertiary)
            }
            Text(subtitle)
                .font(.system(size: 12, weight: .regular))
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

/// A compact lens/grid glyph used as the app mark inside the header.
struct LensMark: View {
    @State private var spin = false
    var body: some View {
        ZStack {
            Circle().stroke(Theme.energy.opacity(0.35), lineWidth: 1.5)
            Circle().trim(from: 0, to: 0.72)
                .stroke(Theme.energyGrad, style: StrokeStyle(lineWidth: 2, lineCap: .round))
                .rotationEffect(.degrees(spin ? 360 : 0))
            Image(systemName: "square.grid.3x3.fill")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(Theme.energy)
        }
        .frame(width: 30, height: 30)
        .onAppear {
            withAnimation(.linear(duration: 14).repeatForever(autoreverses: false)) { spin = true }
        }
    }
}
