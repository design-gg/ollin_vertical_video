var ollincd = {
	_scrollProgressFromParent: false,
	_wheelProgress: 0,

	clamp: function(value, min, max) {
		return Math.max(min, Math.min(max, value));
	},

	rangeProgress: function(progress, start, end) {
		return this.clamp((progress - start) / (end - start), 0, 1);
	},

	setScrollProgress: function(progress) {
		progress = this.clamp(Number(progress) || 0, 0, 1);

		const logo = document.querySelector('.ollincd-logo');
		const bottle1 = document.querySelector('.ollin-bottle-1');
		const bottle2 = document.querySelector('.ollin-bottle-2');
		const bottle3 = document.querySelector('.ollin-bottle-3');

		if (!logo || !bottle1 || !bottle2 || !bottle3) return;

		// Логотип появляется первым
		const logoProgress = this.rangeProgress(progress, 0.02, 0.18);

		logo.style.opacity = logoProgress;
		logo.style.filter =
			`blur(${50 * (1 - logoProgress)}px)`;


		// Банки появляются по очереди
		const p2 = this.rangeProgress(progress, 0.20, 0.40);
		const p3 = this.rangeProgress(progress, 0.43, 0.63);
		const p1 = this.rangeProgress(progress, 0.66, 0.86);


		bottle2.style.opacity = p2;
		bottle3.style.opacity = p3;
		bottle1.style.opacity = p1;


		bottle2.style.transform =
			`translateX(-31%) translateZ(${-150 * (1 - p2)}px)`;

		bottle3.style.transform =
			`translateZ(${-150 * (1 - p3)}px)`;

		bottle1.style.transform =
			`translateX(59%) translateZ(${-150 * (1 - p1)}px)`;
	},


	updateFromLocalScroll: function() {

		// Если progress приходит от родительской страницы,
		// используем его
		if (this._scrollProgressFromParent) return;

		const banner =
			document.querySelector('.ollincd-inner');

		if (!banner) return;


		const maxScroll = Math.max(
			1,
			banner.offsetHeight - window.innerHeight
		);

		const progress =
			window.scrollY / maxScroll;

		this.setScrollProgress(progress);
	},


	toggleMute: function(sender, evt) {

		const e = evt || window.event;

		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}


		sender.classList.toggle('mute-on');


		const video =
			sender.parentNode.querySelector('video');

		const isMuted = video.muted;


		video.muted = !isMuted;


		sender.setAttribute(
			'aria-pressed',
			isMuted
		);

		sender.setAttribute(
			'aria-label',
			!isMuted
				? 'Включить звук'
				: 'Выключить звук'
		);
	}
};



window.addEventListener('load', function() {

	ollincd.setScrollProgress(0);
	ollincd.updateFromLocalScroll();

});



window.addEventListener(
	'scroll',
	function() {

		ollincd.updateFromLocalScroll();

	},
	{ passive: true }
);



window.addEventListener(
	'resize',
	function() {

		ollincd.updateFromLocalScroll();

	}
);



window.addEventListener(
	'wheel',
	function(e) {

		// Резервный вариант для iframe.
		// Скролл страницы при этом не блокируется.

		if (ollincd._scrollProgressFromParent) return;


		const localMaxScroll = Math.max(
			0,
			document.documentElement.scrollHeight -
			window.innerHeight
		);


		// Если iframe сам скроллится,
		// wheel здесь не используем
		if (localMaxScroll > 1) return;


		ollincd._wheelProgress =
			ollincd.clamp(

				ollincd._wheelProgress +
				e.deltaY / 1400,

				0,
				1
			);


		ollincd.setScrollProgress(
			ollincd._wheelProgress
		);

	},
	{ passive: true }
);



// Если баннер находится в iframe,
// родительская страница может передавать:
//
// {
//     type: 'scroll-progress',
//     progress: 0..1
// }

window.addEventListener(
	'message',
	function(e) {

		if (
			!e.data ||
			e.data.type !== 'scroll-progress'
		) {
			return;
		}


		ollincd._scrollProgressFromParent = true;

		ollincd.setScrollProgress(
			e.data.progress
		);

	}
);