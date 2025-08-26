/**
 * This code is a quick hack because I needed to convert a SVG to a PNG in a way that actually supports modern stuff.
 * Do not use this code as a reference for anything.
 */

let state = {
	naturalWidth: undefined, naturalHeight: undefined,
	forceWidth: undefined, forceHeight: undefined,
	aspectRatio: undefined,
	padding: 0,

	get width () {
		if (this.forceWidth) {
			return this.forceWidth;
		}
		else if (this.forceHeight) {
			return this.forceHeight * this.aspectRatio;
		}
		else {
			return this.naturalWidth;
		}
	},

	get height () {
		if (this.forceHeight) {
			return this.forceHeight;
		}
		else if (this.forceWidth) {
			return this.forceWidth / this.aspectRatio;
		}
		else {
			return this.naturalHeight;
		}
	},
};

let blobs = {
	svg: undefined,
	png: undefined,
};

// For debugging
globalThis.state = state;

let canvas = document.getElementById('canvas');

file_input.onchange = evt => {
	let file = evt.target.files[0];
	download_link.download = file.name.replace('.svg', '.png');

	if (blobs.svg) {
		URL.revokeObjectURL(blobs.svg);
	}

	blobs.svg = URL.createObjectURL(file);
	img.src = blobs.svg;
	object_img.data = blobs.svg;
}

img.onload = async () => {
	await img.decode();

	state.naturalWidth = img.naturalWidth;
	state.naturalHeight = img.naturalHeight;

	// naturalWidth and naturalHeight are rounded, so give subtly incorrect aspect ratio
	let rect = img.getBoundingClientRect();
	state.aspectRatio = rect.width / rect.height;

	w.placeholder ||= state.naturalWidth;
	h.placeholder ||= state.naturalHeight;

	w.oninput();
}

w.oninput = h.oninput = evt => {
	state.forceWidth = w.value ? Number(w.value) : undefined;
	state.forceHeight = h.value ? Number(h.value) : undefined;

	if (state.forceWidth) {
		h.placeholder = Math.round(state.forceWidth / state.aspectRatio);
	}
	else {
		h.placeholder = state.naturalHeight;
	}

	if (state.forceHeight) {
		w.placeholder = Math.round(state.forceHeight * state.aspectRatio);
	}
	else {
		w.placeholder = state.naturalWidth;
	}

	img.style.width = state.forceWidth ? state.forceWidth + 'px' : '';
	img.style.height = state.forceHeight ? state.forceHeight + 'px' : '';

	paint();
}

padding_input.oninput = evt => {
	state.padding = Number(padding_input.value) || 0;

	paint();
}

function paint() {
	canvas.width = state.width + state.padding * 2;
	canvas.height = state.height + state.padding * 2;
	canvas.style.zoom = 1/devicePixelRatio;

	let ctx = canvas.getContext('2d', {
		colorSpace: "display-p3",
		colorType: "float16",
	});

	ctx.drawImage(img, state.padding, state.padding, state.width, state.height);

	// Canvas → PNG
	canvas.toBlob(blob => {
		if (blob) {
			let previous = blobs.png;

			blobs.png = URL.createObjectURL(blob);
			png_img.src = blobs.png;
			download_link.href = blobs.png;

			if (blobs.svg && (document.activeElement === document.body || document.activeElement === file_input)) {
				// Is not the placeholder
				download_link.focus();
			}

			if (previous) {
				requestAnimationFrame(() => {
					URL.revokeObjectURL(previous);
				});
			}
		}
	}, 'image/png');
}
