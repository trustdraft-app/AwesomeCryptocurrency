//
//  GridLens360App.swift
//  GridLens 360 — Real-Time Grid Intelligence
//
//  Executive dashboard of the Saudi Electricity Company Eastern Operating Area
//  transmission grid. Offline, boardroom-grade, telemetry-framed.
//
//  Bundle: com.mohamedalsaeed.gridlens360 · Team: Y94NRXX75N
//

import SwiftUI

@main
struct GridLens360App: App {
    var body: some Scene {
        WindowGroup {
            RootContainer()
        }
    }
}

/// Shows the boot screen, then reveals the instrument.
struct RootContainer: View {
    @State private var booted = false
    var body: some View {
        ZStack {
            RootTabView()
                .opacity(booted ? 1 : 0)
            if !booted {
                BootScreen()
                    .transition(.opacity)
            }
        }
        .preferredColorScheme(.dark)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.7) {
                withAnimation(.easeInOut(duration: 0.55)) { booted = true }
            }
        }
    }
}

/// The power-on boot screen — the lens mark assembles and the wordmark settles.
struct BootScreen: View {
    @State private var appear = false
    @State private var sweep: CGFloat = 0

    var body: some View {
        ZStack {
            Theme.screenBackground.ignoresSafeArea()
            RadialGradient(colors: [Theme.energy.opacity(0.14), .clear],
                           center: .center, startRadius: 2, endRadius: 320)
                .ignoresSafeArea()
            VStack(spacing: 20) {
                ZStack {
                    Circle().stroke(Theme.hairline, lineWidth: 2).frame(width: 96, height: 96)
                    Circle().trim(from: 0, to: sweep)
                        .stroke(Theme.energyGrad,
                                style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .frame(width: 96, height: 96)
                        .rotationEffect(.degrees(-90))
                    Image(systemName: "grid")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundStyle(Theme.energy)
                        .shadow(color: Theme.energy.opacity(0.6), radius: 12)
                        .scaleEffect(appear ? 1 : 0.6)
                        .opacity(appear ? 1 : 0)
                }
                VStack(spacing: 4) {
                    Text("GRIDLENS 360")
                        .font(.system(size: 26, weight: .heavy).width(.expanded))
                        .tracking(2)
                        .foregroundStyle(Theme.textPrimary)
                        .opacity(appear ? 1 : 0)
                    Text("REAL-TIME GRID INTELLIGENCE")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(3)
                        .foregroundStyle(Theme.textTertiary)
                        .opacity(appear ? 1 : 0)
                }
                Text("EASTERN OPERATING AREA · SNAPSHOT 12 JUL 2026")
                    .font(.system(size: 9, weight: .medium, design: .monospaced))
                    .foregroundStyle(Theme.textTertiary)
                    .opacity(appear ? 0.9 : 0)
                    .padding(.top, 6)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.7)) { appear = true }
            withAnimation(.easeInOut(duration: 1.5)) { sweep = 1 }
        }
    }
}
