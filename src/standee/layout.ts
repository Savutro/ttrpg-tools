import type { ExpandedStandee, LayoutSettings, PlacedStandee, Standee } from "./types";

export const MM_PER_INCH = 25.4;
export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;

export function getLabelSpaceMm(settings: Pick<LayoutSettings, "labelSizePt" | "showLabels">): number {
  if (!settings.showLabels || settings.labelSizePt <= 0) return 0;
  return Math.max(4, (settings.labelSizePt * 0.3528) + 2.2);
}

export function expandStandees(standees: Standee[], settings: LayoutSettings): ExpandedStandee[] {
  const topSpaceMm = getLabelSpaceMm(settings);
  const output: ExpandedStandee[] = [];

  for (const standee of standees) {
    const widthMm = standee.baseWidthInches * MM_PER_INCH;
    const panelHeightInches = standee.heightOverrideInches
      ?? (standee.baseWidthInches * standee.aspectRatio);
    const artworkHeightMm = panelHeightInches * MM_PER_INCH;
    const panelHeightMm = artworkHeightMm + topSpaceMm + settings.bottomSpaceMm;
    const totalHeightMm = (panelHeightMm * 2) + settings.tabHeightMm;

    for (let copy = 0; copy < standee.copies; copy += 1) {
      output.push({
        ...standee,
        widthMm,
        artworkHeightMm,
        panelHeightMm,
        totalHeightMm,
        tabHeightMm: settings.tabHeightMm,
        topSpaceMm,
        bottomSpaceMm: settings.bottomSpaceMm
      });
    }
  }

  return output;
}

export function packStandees(
  items: ExpandedStandee[],
  availableWidth: number,
  availableHeight: number,
  gap: number
): PlacedStandee[][] {
  const pages: PlacedStandee[][] = [];
  let currentPage: PlacedStandee[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  for (const item of items) {
    const oversized = item.widthMm > availableWidth || item.totalHeightMm > availableHeight;
    const placedItem = { ...item, oversized };

    if (oversized) {
      if (currentPage.length) pages.push(currentPage);
      pages.push([{ ...placedItem, x: 0, y: 0 }]);
      currentPage = [];
      x = 0;
      y = 0;
      rowHeight = 0;
      continue;
    }

    if (x > 0 && x + item.widthMm > availableWidth) {
      x = 0;
      y += rowHeight + gap;
      rowHeight = 0;
    }

    if (currentPage.length && y + item.totalHeightMm > availableHeight) {
      pages.push(currentPage);
      currentPage = [];
      x = 0;
      y = 0;
      rowHeight = 0;
    }

    currentPage.push({ ...placedItem, x, y });
    x += item.widthMm + gap;
    rowHeight = Math.max(rowHeight, item.totalHeightMm);
  }

  if (currentPage.length) pages.push(currentPage);
  return pages;
}
