var ollincd = {

	_scrollProgressFromParent: false,
	_wheelProgress: 0,

	_targetProgress: 0,
	_currentProgress: 0,
	_animationFrame: null,


	clamp: function(value, min, max) {
		return Math.max(min, Math.min(max, value));
	},


	rangeProgress: function(progress, start, end) {
		return this.clamp(
			(progress - start) / (end - start),
			0,
			1
		);
	},


	setScrollProgress: function(progress) {

		progress = this.clamp(
			Number(progress) || 0,
			0,
			1
		);


		const logo =
			document.querySelector('.ollincd-logo');

		const bottle1 =
			document.querySelector('.ollin-bottle-1');

		const bottle2 =
			document.querySelector('.ollin-bottle-2');

		const bottle3 =
			document.querySelector('.ollin-bottle-3');

		const motto =
			document.querySelector('.ollincd-motto');

		const ads =
			document.querySelector('.ollincd-ads');


		if (
			!logo ||
			!bottle1 ||
			!bottle2 ||
			!bottle3 ||
			!motto ||
			!ads
		) {
			return;
		}



		// -------------------------
		// 1. ЛОГО
		// -------------------------

		const logoProgress =
			this.rangeProgress(
				progress,
				0.00,
				0.16
			);


		logo.style.opacity =
			logoProgress;


		logo.style.filter =
			`blur(${50 * (1 - logoProgress)}px)`;



		// -------------------------
		// 2. БУТЫЛКИ
		// -------------------------

		const p2 =
			this.rangeProgress(
				progress,
				0.22,
				0.38
			);


		const p3 =
			this.rangeProgress(
				progress,
				0.36,
				0.52
			);


		const p1 =
			this.rangeProgress(
				progress,
				0.50,
				0.66
			);



		bottle2.style.opacity = p2;
		bottle3.style.opacity = p3;
		bottle1.style.opacity = p1;



		bottle2.style.transform =
			`translateX(-31%) translateZ(${
				-150 * (1 - p2)
			}px)`;


		bottle3.style.transform =
			`translateZ(${
				-150 * (1 - p3)
			}px)`;


		bottle1.style.transform =
			`translateX(59%) translateZ(${
				-150 * (1 - p1)
			}px)`;



		// -------------------------
		// 3. СЛОГАН + ДИСКЛЕЙМЕР
		// -------------------------

		const textProgress =
			this.rangeProgress(
				progress,
				0.74,
				0.94
			);



		motto.style.opacity =
			textProgress;


		motto.style.transform =
			`translateY(${
				40 * (1 - textProgress)
			}px)`;



		ads.style.opacity =
			textProgress;


		ads.style.transform =
			`translateY(${
				25 * (1 - textProgress)
			}px)`;
	},



	// ---------------------------------
	// ПЛАВНОЕ ДОГОНЯНИЕ СКРОЛЛА
	// ---------------------------------

	setTargetProgress: function(progress) {

		this._targetProgress =
			this.clamp(
				Number(progress) || 0,
				0,
				1
			);


		if (!this._animationFrame) {
			this.animateProgress();
		}
	},



	animateProgress: function() {

		const self = this;


		const difference =
			self._targetProgress -
			self._currentProgress;


		/*
			Скорость реакции на скролл.

			0.04  — быстрее
			0.025 — средняя задержка
			0.018 — заметная задержка
			0.012 — очень плавно

			Для клиента я бы оставил 0.02.
		*/

		const speed = 0.02;


		self._currentProgress +=
			difference * speed;



		if (Math.abs(difference) < 0.001) {

			self._currentProgress =
				self._targetProgress;

		}



		self.setScrollProgress(
			self._currentProgress
		);



		if (
			Math.abs(
				self._targetProgress -
				self._currentProgress
			) > 0.001
		) {

			self._animationFrame =
				requestAnimationFrame(
					function() {
						self.animateProgress();
					}
				);

		} else {

			self._animationFrame = null;

		}
	},



	updateFromLocalScroll: function() {

		if (
			this._scrollProgressFromParent
		) {
			return;
		}


		const banner =
			document.querySelector(
				'.ollincd-inner'
			);


		if (!banner) return;



		const maxScroll =
			Math.max(
				1,
				banner.offsetHeight -
				window.innerHeight
			);



		const progress =
			window.scrollY /
			maxScroll;



		this.setTargetProgress(
			progress
		);
	},



	toggleMute: function(sender, evt) {

		const e =
			evt || window.event;


		if (e) {

			e.preventDefault();
			e.stopPropagation();

		}



		sender.classList.toggle(
			'mute-on'
		);



		const video =
			sender.parentNode
				.querySelector('video');


		const isMuted =
			video.muted;



		video.muted =
			!isMuted;



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



// ---------------------------------
// LOAD
// ---------------------------------

window.addEventListener(
	'load',
	function() {

		ollincd.setScrollProgress(0);

		ollincd.updateFromLocalScroll();

	}
);



// ---------------------------------
// SCROLL
// ---------------------------------

window.addEventListener(
	'scroll',
	function() {

		ollincd.updateFromLocalScroll();

	},
	{
		passive: true
	}
);



// ---------------------------------
// RESIZE
// ---------------------------------

window.addEventListener(
	'resize',
	function() {

		ollincd.updateFromLocalScroll();

	}
);



// ---------------------------------
// WHEEL — резерв для iframe
// ---------------------------------

window.addEventListener(
	'wheel',
	function(e) {

		if (
			ollincd._scrollProgressFromParent
		) {
			return;
		}



		const localMaxScroll =
			Math.max(
				0,
				document.documentElement
					.scrollHeight -
				window.innerHeight
			);



		if (localMaxScroll > 1) {
			return;
		}



		ollincd._wheelProgress =
			ollincd.clamp(

				ollincd._wheelProgress +
				e.deltaY / 1400,

				0,
				1
			);



		ollincd.setTargetProgress(
			ollincd._wheelProgress
		);

	},
	{
		passive: true
	}
);



// ---------------------------------
// POSTMESSAGE ИЗ РОДИТЕЛЬСКОЙ СТРАНИЦЫ
// ---------------------------------

window.addEventListener(
	'message',
	function(e) {

		if (
			!e.data ||
			e.data.type !==
				'scroll-progress'
		) {
			return;
		}



		ollincd._scrollProgressFromParent =
			true;



		ollincd.setTargetProgress(
			e.data.progress
		);

	}
);
