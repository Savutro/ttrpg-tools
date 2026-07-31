(() => {
  'use strict';

  const MM_PER_INCH = 25.4;
  const PAGE_WIDTH_MM = 210;
  const PAGE_HEIGHT_MM = 297;
  const $ = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Required element not found: ${selector}`);
    return element;
  };

  interface SelectedImage {
    src: string;
    filename: string;
    width: number;
    height: number;
    aspectRatio: number;
  }

  interface Standee {
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

  interface ExpandedStandee extends Standee {
    widthMm: number;
    artworkHeightMm: number;
    panelHeightMm: number;
    totalHeightMm: number;
    tabHeightMm: number;
    topSpaceMm: number;
    bottomSpaceMm: number;
  }

  interface PlacedStandee extends ExpandedStandee {
    oversized: boolean;
    x: number;
    y: number;
  }

  const ui = {
    fileInput: $<HTMLInputElement>('#fileInput'),
    dropZone: $<HTMLElement>('#dropZone'),
    uploadTitle: $<HTMLElement>('#uploadTitle'),
    selectedArt: $<HTMLElement>('#selectedArt'),
    selectedPreview: $<HTMLImageElement>('#selectedPreview'),
    selectedFilename: $<HTMLElement>('#selectedFilename'),
    selectedDimensions: $<HTMLElement>('#selectedDimensions'),
    characterName: $<HTMLInputElement>('#characterName'),
    creatureSize: $<HTMLSelectElement>('#creatureSize'),
    heightOverride: $<HTMLInputElement>('#heightOverride'),
    autoHeightHint: $<HTMLElement>('#autoHeightHint'),
    copies: $<HTMLInputElement>('#copies'),
    addStandee: $<HTMLButtonElement>('#addStandee'),
    pageMargin: $<HTMLInputElement>('#pageMargin'),
    itemGap: $<HTMLInputElement>('#itemGap'),
    glueTab: $<HTMLInputElement>('#glueTab'),
    labelSize: $<HTMLInputElement>('#labelSize'),
    bottomSpace: $<HTMLInputElement>('#bottomSpace'),
    showLabels: $<HTMLInputElement>('#showLabels'),
    showLines: $<HTMLInputElement>('#showLines'),
    roster: $<HTMLElement>('#roster'),
    pages: $<HTMLElement>('#pages'),
    layoutWarning: $<HTMLElement>('#layoutWarning'),
    printButton: $<HTMLButtonElement>('#printButton'),
    clearButton: $<HTMLButtonElement>('#clearButton')
  };

  let selectedImage: SelectedImage | null = null;
  let standees: Standee[] = [];
  let nextId = 1;
  let hasOversizedItems = false;

  const numericValue = (element: HTMLInputElement | HTMLSelectElement, fallback: number): number => {
    const value = Number.parseFloat(element.value);
    return Number.isFinite(value) ? value : fallback;
  };

  const escapeHtml = (value: unknown): string => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  } satisfies Record<string, string>)[character] ?? character);

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read the image.'));
    reader.onerror = () => reject(reader.error || new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });

  const readImageDimensions = (src: string): Promise<{ width: number; height: number }> => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = src;
  });

  async function selectFile(file?: File) {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) {
      window.alert('Choose a PNG, JPG, or WebP image.');
      return;
    }

    try {
      const src = await readFileAsDataUrl(file);
      const dimensions = await readImageDimensions(src);
      selectedImage = {
        src,
        filename: file.name,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: dimensions.height / dimensions.width
      };

      ui.selectedPreview.src = src;
      ui.selectedFilename.textContent = file.name;
      ui.selectedDimensions.textContent = `${dimensions.width} × ${dimensions.height}px · ${selectedImage.aspectRatio.toFixed(2)}:1 height ratio`;
      ui.selectedArt.hidden = false;
      ui.uploadTitle.textContent = 'Choose a different artwork';

      if (!ui.characterName.value.trim()) {
        ui.characterName.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      }
      updateAutoHeightHint();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : 'The selected image could not be loaded.');
    }
  }

  function getBaseWidthInches() {
    return Math.max(0.25, numericValue(ui.creatureSize, 1));
  }

  function getPanelHeightInches(image: SelectedImage, overrideValue = ui.heightOverride.value) {
    const override = Number.parseFloat(overrideValue);
    if (Number.isFinite(override) && override > 0) return override;
    return getBaseWidthInches() * image.aspectRatio;
  }

  function updateAutoHeightHint() {
    if (!selectedImage) {
      ui.autoHeightHint.textContent = 'Chosen automatically from the image.';
      return;
    }
    const autoHeight = getBaseWidthInches() * selectedImage.aspectRatio;
    ui.autoHeightHint.textContent = ui.heightOverride.value
      ? `Manual height. Automatic would be ${autoHeight.toFixed(2)} inches.`
      : `Automatic height: ${autoHeight.toFixed(2)} inches from the image ratio.`;
  }

  function addStandee() {
    if (!selectedImage) {
      window.alert('Choose character artwork first.');
      return;
    }

    const baseWidthInches = getBaseWidthInches();
    const heightOverride = Number.parseFloat(ui.heightOverride.value);
    const copies = Math.min(50, Math.max(1, Math.floor(numericValue(ui.copies, 1))));
    const fallbackName = selectedImage.filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

    standees.push({
      id: nextId++,
      name: ui.characterName.value.trim() || fallbackName,
      src: selectedImage.src,
      filename: selectedImage.filename,
      imageWidth: selectedImage.width,
      imageHeight: selectedImage.height,
      aspectRatio: selectedImage.aspectRatio,
      baseWidthInches,
      heightOverrideInches: Number.isFinite(heightOverride) && heightOverride > 0 ? heightOverride : null,
      copies
    });

    // Deliberately keep the chosen file, preview, name, size, and height in the builder.
    render();
  }

  function duplicateStandee(id: number) {
    const original = standees.find((standee) => standee.id === id);
    if (!original) return;
    standees.push({ ...original, id: nextId++ });
    render();
  }

  function removeStandee(id: number) {
    standees = standees.filter((standee) => standee.id !== id);
    render();
  }

  function expandedStandees() {
    const tabHeightMm = Math.max(0, numericValue(ui.glueTab, 8));
    const labelSizePt = Math.max(0, numericValue(ui.labelSize, 7));
    const topSpaceMm = ui.showLabels.checked && labelSizePt > 0
      ? Math.max(4, (labelSizePt * 0.3528) + 2.2)
      : 0;
    const bottomSpaceMm = Math.max(0, numericValue(ui.bottomSpace, 0));
    const output: ExpandedStandee[] = [];

    for (const standee of standees) {
      const widthMm = standee.baseWidthInches * MM_PER_INCH;
      const panelHeightInches = standee.heightOverrideInches || (standee.baseWidthInches * standee.aspectRatio);
      const artworkHeightMm = panelHeightInches * MM_PER_INCH;
      const panelHeightMm = artworkHeightMm + topSpaceMm + bottomSpaceMm;
      const totalHeightMm = (panelHeightMm * 2) + tabHeightMm;

      for (let copy = 0; copy < standee.copies; copy += 1) {
        output.push({
          ...standee,
          widthMm,
          artworkHeightMm,
          panelHeightMm,
          totalHeightMm,
          tabHeightMm,
          topSpaceMm,
          bottomSpaceMm
        });
      }
    }
    return output;
  }

  function packStandees(items: ExpandedStandee[], availableWidth: number, availableHeight: number, gap: number): PlacedStandee[][] {
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

  function createSide(className: 'front-side' | 'back-side', standee: ExpandedStandee) {
    const side = document.createElement('div');
    side.className = `panel-side ${className}`;
    side.style.height = `${standee.panelHeightMm}mm`;

    const image = document.createElement('img');
    image.src = standee.src;
    image.alt = '';
    image.style.height = `${standee.artworkHeightMm}mm`;
    side.append(image);

    if (className === 'front-side' && ui.showLabels.checked && numericValue(ui.labelSize, 7) > 0) {
      const label = document.createElement('div');
      label.className = 'character-label';
      label.style.fontSize = `${numericValue(ui.labelSize, 7)}pt`;
      label.textContent = standee.name;
      side.append(label);
    }

    return side;
  }

  function renderRoster() {
    if (!standees.length) {
      ui.roster.innerHTML = '<div class="roster-empty">The roster is empty. Add a hero, monster, or unfortunate villager.</div>';
      return;
    }

    ui.roster.innerHTML = standees.map((standee) => {
      const height = standee.heightOverrideInches || (standee.baseWidthInches * standee.aspectRatio);
      const mode = standee.heightOverrideInches ? 'manual' : 'auto';
      return `
        <article class="roster-item">
          <img class="roster-thumb" src="${standee.src}" alt="">
          <div class="roster-copy">
            <strong title="${escapeHtml(standee.name)}">${escapeHtml(standee.name)}</strong>
            <small>${standee.baseWidthInches}\" base · ${height.toFixed(2)}\" tall (${mode}) · ${standee.copies} ${standee.copies === 1 ? 'copy' : 'copies'}</small>
          </div>
          <div class="roster-actions">
            <button class="icon-button" type="button" data-action="duplicate" data-id="${standee.id}" title="Duplicate">＋</button>
            <button class="icon-button remove" type="button" data-action="remove" data-id="${standee.id}" title="Remove">×</button>
          </div>
        </article>`;
    }).join('');
  }

  function renderPages() {
    const marginMm = Math.max(0, numericValue(ui.pageMargin, 8));
    const gapMm = Math.max(0, numericValue(ui.itemGap, 4));
    const availableWidth = PAGE_WIDTH_MM - (marginMm * 2);
    const availableHeight = PAGE_HEIGHT_MM - (marginMm * 2);
    const pages = packStandees(expandedStandees(), availableWidth, availableHeight, gapMm);

    ui.pages.innerHTML = '';
    hasOversizedItems = pages.some((page) => page.some((item) => item.oversized));

    if (!pages.length) {
      const page = document.createElement('section');
      page.className = 'page';
      page.innerHTML = '<div class="empty-page"><div><span class="empty-sigil">✦</span><strong>No standees forged yet</strong><span>Choose artwork and add a character to begin arranging the A4 sheet.</span></div></div>';
      ui.pages.append(page);
      ui.layoutWarning.hidden = true;
      return;
    }

    for (const pageItems of pages) {
      const page = document.createElement('section');
      page.className = 'page';

      const inner = document.createElement('div');
      inner.className = 'page-inner';
      inner.style.inset = `${marginMm}mm`;

      for (const item of pageItems) {
        const standee = document.createElement('article');
        standee.className = `standee${ui.showLines.checked ? '' : ' no-guides'}`;
        standee.style.cssText = [
          `left:${item.x}mm`,
          `top:${item.y}mm`,
          `width:${item.widthMm}mm`,
          `height:${item.totalHeightMm}mm`,
          `--panel-height:${item.panelHeightMm}mm`,
          `--tab-height:${item.tabHeightMm}mm`,
          `--label-space:${item.topSpaceMm}mm`,
          `--bottom-space:${item.bottomSpaceMm}mm`
        ].join(';');

        // Sheet order: vertically flipped silhouette, head fold, upright front, glue tab.
        standee.append(createSide('back-side', item));
        standee.append(createSide('front-side', item));

        const foldLine = document.createElement('div');
        foldLine.className = 'fold-line';
        standee.append(foldLine);

        if (item.tabHeightMm > 0) {
          const tab = document.createElement('div');
          tab.className = 'glue-tab';
          tab.textContent = 'GLUE TAB';
          standee.append(tab);
        }

        if (item.oversized) {
          const marker = document.createElement('div');
          marker.className = 'oversized-marker';
          marker.textContent = 'TOO LARGE FOR THE CURRENT A4 LAYOUT';
          standee.append(marker);
        }

        inner.append(standee);
      }

      page.append(inner);
      ui.pages.append(page);
    }

    if (hasOversizedItems) {
      const labelSizePt = Math.max(0, numericValue(ui.labelSize, 7));
      const topSpaceMm = ui.showLabels.checked && labelSizePt > 0 ? Math.max(4, (labelSizePt * 0.3528) + 2.2) : 0;
      const reservedSpaceMm = topSpaceMm + Math.max(0, numericValue(ui.bottomSpace, 0));
      const maxArtworkHeightMm = Math.max(0, ((availableHeight - Math.max(0, numericValue(ui.glueTab, 8))) / 2) - reservedSpaceMm);
      ui.layoutWarning.innerHTML = `<strong>One or more standees are too tall for A4.</strong> With the current margins, label, bottom clearance, and glue tab, the maximum character height is ${(maxArtworkHeightMm / MM_PER_INCH).toFixed(2)} inches. Enter a smaller optional height for those standees before printing.`;
      ui.layoutWarning.hidden = false;
    } else {
      ui.layoutWarning.hidden = true;
    }
  }

  function render() {
    renderRoster();
    renderPages();
  }

  ui.fileInput.addEventListener('change', () => selectFile(ui.fileInput.files?.[0]));
  ui.dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    ui.dropZone.classList.add('dragover');
  });
  ui.dropZone.addEventListener('dragleave', () => ui.dropZone.classList.remove('dragover'));
  ui.dropZone.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();
    ui.dropZone.classList.remove('dragover');
    const file = event.dataTransfer?.files[0];
    if (file) selectFile(file);
  });

  ui.addStandee.addEventListener('click', addStandee);
  ui.creatureSize.addEventListener('change', updateAutoHeightHint);
  ui.heightOverride.addEventListener('input', updateAutoHeightHint);

  ui.roster.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;
    const id = Number.parseInt(button.dataset.id ?? '', 10);
    if (!Number.isFinite(id)) return;
    if (button.dataset.action === 'duplicate') duplicateStandee(id);
    if (button.dataset.action === 'remove') removeStandee(id);
  });

  [ui.pageMargin, ui.itemGap, ui.glueTab, ui.labelSize, ui.bottomSpace, ui.showLabels, ui.showLines]
    .forEach((element) => {
      element.addEventListener('input', renderPages);
      element.addEventListener('change', renderPages);
    });

  ui.clearButton.addEventListener('click', () => {
    if (standees.length && !window.confirm('Remove every standee from the sheet?')) return;
    standees = [];
    render();
  });

  ui.printButton.addEventListener('click', () => {
    if (!standees.length) {
      window.alert('Add at least one standee before printing.');
      return;
    }
    if (hasOversizedItems) {
      window.alert('At least one standee is too tall for the current A4 layout. Set a smaller optional height before printing.');
      return;
    }
    window.print();
  });

  render();
})();
