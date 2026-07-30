window.addEventListener("load", () => {

	let banner;
	if(banner = document.querySelector(".ollincd")) {
		banner.classList.add("loaded");
	}

});

var ollincd = {
	toggleMute: function(sender) {
		event.preventDefault();
		event.stopPropagation();
		sender.classList.toggle("mute-on");
		let video = sender.parentNode.querySelector("video");
		let isMuted = video.muted;

		video.muted = !isMuted;

		sender.setAttribute('aria-pressed', isMuted);
		sender.setAttribute('aria-label', !isMuted ? 'Включить звук' : 'Выключить звук');
	}
}