//
//  Primitives.swift
//  GridLens 360
//
//  Small shared building blocks: section headers, the honesty stamp, and the
//  provenance chip that carries every number's PI tag + timestamp.
//

import SwiftUI

/// Expanded, tracked section label used at the top of every board.
struct SectionHeader: View {
    let title: String
    var accent: Color = Theme.energy
    var trailing: String? = nil
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            RoundedRectangle(cornerRadius: 2)
                .fill(accent)
                .frame(width: 3, height: 13)
            Text(title.uppercased())
                .font(Theme.sectionTitle)
                .tracking(1.2)
                .foregroundStyle(Theme.textPrimary)
            Spacer(minLength: 6)
            if let trailing {
                Text(trailing.uppercased())
                    .font(Theme.caption)
                    .tracking(0.8)
                    .foregroundStyle(Theme.textTertiary)
            }
        }
    }
}

/// The provenance / honesty stamp. SNAPSHOT is steady; LIVE pulses.
struct StatusStamp: View {
    let basis: MetricBasis
    var timestamp: String? = nil
    @State private var pulse = false

    private var tint: Color {
        switch basis {
        case .live: return Theme.export
        case .snapshot: return Theme.energy
        case .report: return Theme.reportGrey
        }
    }
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(tint)
                .frame(width: 7, height: 7)
                .shadow(color: tint, radius: pulse ? 5 : 1)
                .scaleEffect(basis == .live ? (pulse ? 1.25 : 0.85) : 1)
            Text(stampText)
                .font(.system(size: 10, weight: .bold))
                .tracking(1.1)
                .foregroundStyle(tint)
        }
        .padding(.horizontal, 9).padding(.vertical, 5)
        .background(Capsule().fill(tint.opacity(0.12)))
        .overlay(Capsule().strokeBorder(tint.opacity(0.3), lineWidth: 1))
        .onAppear { if basis == .live { withAnimation(Theme.ambient) { pulse = true } } }
    }
    private var stampText: String {
        if let ts = timestamp { return "\(basis.short) · \(ts)" }
        return basis.short
    }
}

/// The provenance chip that sits under a number (BINDING LAW #1). A harvested PI
/// tag / feed apply-key shows a "#" in monospace; an honest derivation descriptor
/// shows a "function" glyph in the regular face — never dressing a description up
/// as a tag.
struct TagChip: View {
    let tag: String
    var timestamp: String? = nil
    var isPITag: Bool = true
    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: isPITag ? "number" : "function")
                .font(.system(size: 8, weight: .bold))
                .foregroundStyle(Theme.textTertiary)
            Text(tag)
                .font(.system(size: 9.5, weight: isPITag ? .medium : .semibold,
                              design: isPITag ? .monospaced : .default))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)
                .truncationMode(.middle)
            if let timestamp {
                Text("·")
                    .foregroundStyle(Theme.textTertiary)
                Text(timestamp)
                    .font(.system(size: 9.5, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textTertiary)
            }
        }
        .padding(.horizontal, 8).padding(.vertical, 4)
        .background(Capsule().fill(Theme.bgElevated))
        .overlay(Capsule().strokeBorder(Theme.hairlineSoft, lineWidth: 1))
    }
}

/// Directional pill (→ export, ← import, ⇄ report magnitude-only).
struct DirectionPill: View {
    let origin: String
    let destination: String
    let color: Color
    var reportOnly: Bool = false
    var body: some View {
        HStack(spacing: 6) {
            Text(origin).font(.system(size: 11, weight: .heavy))
            Image(systemName: reportOnly ? "arrow.left.arrow.right" : "arrow.right")
                .font(.system(size: 10, weight: .black))
            Text(destination).font(.system(size: 11, weight: .heavy))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 10).padding(.vertical, 5)
        .background(Capsule().fill(color.opacity(0.13)))
        .overlay(Capsule().strokeBorder(color.opacity(0.35), lineWidth: 1))
    }
}
