export interface SelectedImage {
  src: string;
  filename: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface Standee {
  id: number;
  name: string;
  src: string;
  filename: string;
  imageWidth: number;
  imageHeight: number;
  aspectRatio: number;
  baseWidthInches: number;
  heightOverrideInches: number | null;
  copies: number;
}

export interface LayoutSettings {
  tabHeightMm: number;
  labelSizePt: number;
  showLabels: boolean;
  bottomSpaceMm: number;
}

export interface ExpandedStandee extends Standee {
  widthMm: number;
  artworkHeightMm: number;
  panelHeightMm: number;
  totalHeightMm: number;
  tabHeightMm: number;
  topSpaceMm: number;
  bottomSpaceMm: number;
}

export interface PlacedStandee extends ExpandedStandee {
  oversized: boolean;
  x: number;
  y: number;
}
