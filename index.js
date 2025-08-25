let url;
let width, height;
let naturalWidth, naturalHeight, aspectRatio;

let canvas = document.getElementById('canvas');
let png;

file_input.onchange = evt => {
	let file = evt.target.files[0];
	download_link.download = file.name.replace('.svg', '.png');

	if (url) {
		URL.revokeObjectURL(url);
	}

	url = URL.createObjectURL(file);
	img.src = url;
}

img.onload = async () => {
	await img.decode();

	naturalWidth = img.naturalWidth;
	naturalHeight = img.naturalHeight;
	aspectRatio = naturalWidth / naturalHeight;

	w.placeholder ||= naturalWidth;
	h.placeholder ||= naturalHeight;

	w.oninput();
}

w.oninput = h.oninput = padding_input.oninput = evt => {
	if (w.value) {
		h.placeholder = Math.round(w.valueAsNumber / aspectRatio);
	}
	else {
		h.placeholder = naturalHeight;
	}

	if (h.value) {
		w.placeholder = Math.round(h.valueAsNumber * aspectRatio);
	}
	else {
		w.placeholder = naturalWidth;
	}

	let forceWidth = w.value;
	let forceHeight = h.value;

	if (forceWidth || forceHeight) {
		if (forceWidth) {
			forceWidth = Number(forceWidth);
			img.style.width = forceWidth + 'px';
		}
		else {
			img.style.width = '';
		}

		if (forceHeight) {
			forceHeight = Number(forceHeight);
			img.style.height = forceHeight + 'px';
		}
		else {
			img.style.height = '';
		}
	}

	width = undefined;
	height = undefined;

	if (forceWidth) {
		width = forceWidth;

		if (forceHeight) {
			height = width / aspectRatio;
		}
	}
	else if (forceHeight) {
		height = forceHeight;
		width = height * aspectRatio;
	}
	else {
		width = naturalWidth;
		height = naturalHeight;
	}

	paint();
}

function paint() {
	canvas.width = width;
	canvas.height = height;
	canvas.style.zoom = 1/devicePixelRatio;
	png_img.style.zoom = 1/devicePixelRatio;

	let padding = Number(padding_input.value) || 0;

	let ctx = canvas.getContext('2d', {
		colorSpace: "display-p3",
		colorType: "float16",
	});
	ctx.drawImage(img, padding, padding, width - padding * 2, height - padding * 2);



	canvas.toBlob(blob => {
		if (blob) {
			let previous = png;

			png = URL.createObjectURL(blob);
			png_img.src = png;
			download_link.href = png;

			if (previous) {
				requestAnimationFrame(() => {
					URL.revokeObjectURL(previous);
				});
			}
		}
	}, 'image/png');
}
