Number.prototype.time = function(){
    let min = parseInt(this / 60);
    let sec = parseInt(this % 60);
    if(sec < 10) sec = "0" + sec;

    return `${min}:${sec}`;
};

class App {
    constructor() {

		this.musicList = new Array;		
		this.nowMusic;
		this.beMusicList = false;
		this.playList = new Array;
		
		let player= new Player(this);
		this.Audio = new Audio;

		// dom
		this.contextmenu = document.querySelector("#contextmenu");
		this.$$musicCard = document.querySelectorAll(".music > div > div");
        
        this.init();
    }

    init() {
		new Promise((res,rej)=>{
			$.getJSON('js/music_list.json', (data) =>{
				data.forEach(music => {
					this.musicList.push(music);
				});
				res();
			})
		}).then(()=>{
			this.addEvent();
		});
	}
	
	addEvent(){ 

		//mouseEvent
		
		window.addEventListener("click", (e)=>{
			this.contextmenu.style.display = 'none';
			
		})

		this.$$musicCard.forEach(music=>{
			music.addEventListener("contextmenu", (e)=>{
				event.preventDefault();
				this.contextmenu.style.top = e.pageY + "px";
				this.contextmenu.style.left = e.pageX + "px";
				this.contextmenu.style.display = 'block';
				this.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.classList[0]) this.nowMusic = list
				})
			})
		})

		this.contextmenu.addEventListener("click", (e)=>{
			if(e.target.classList[0] === "add-play-list") {
				this.playList.forEach(i=>{
					
				})
				if(this.playList.indexOf(this.nowMusic) != -1) return;
				this.playList.push(this.nowMusic)
				this.beMusicList = true;
				this.Audio.src = `/B/m/${this.playList[0].url}`;
			}
		})
		
	}
}

class Player { 
	constructor(app) {
		this.app = app;

		this.musicPlayerTop = document.querySelector(".music-player-top");
		
		this.coverImg = document.querySelector(".cover-img");
		this.musicText = document.querySelector(".music-text");
		this.viewLyricsBtn = document.querySelector(".view-lyrics-btn");
 
		this.nowTime = document.querySelector(".now-time");
		this.allTime = document.querySelector(".all-time");
		this.timeBar = document.querySelector("#time-bar");

		this.forwardBtn = document.querySelector(".fa-step-forward");
		this.playCircleBtn = document.querySelector(".fa-play");
		this.stopCircleBtn = document.querySelector(".fa-pause");
		this.backwardBtn = document.querySelector(".fa-step-backward");
		this.soundinput = document.querySelector("#sound-set");
		this.soundPercent = document.querySelector(".sound-percent");

		this.playNum = 0;

		new Promise((res,rej)=>{
			this.player();
			res();
		}).then(()=>{
			this.addEvent();
		});
	} 

	player() {
		if(this.app.beMusicList) {
			this.coverImg.innerHTML = `<img src="/B/covers/${this.app.playList[this.playNum].albumImage}"></img>`
			this.musicText.innerHTML = `<p><span>${this.app.playList[this.playNum].name}</span><br>${this.app.playList[this.playNum].artist}</p>`
			this.nowTime.innerHTML = this.app.Audio.currentTime.time();
			this.allTime.innerHTML = this.app.Audio.duration.time();

			if(this.app.Audio.currentTime == this.app.Audio.duration) this.pause();
			this.timeBar.value = (this.app.Audio.currentTime * 100) / this.app.Audio.duration;
			var val = $('input[type=range]').val();
			$('input[type=range]').css('background', 'linear-gradient(to right, #ff8888 0%, #ff8888 '+ val +'%, #e4e4e4 ' + val + '%, #e4e4e4 ' + $('input[type=range]')[0].max + '%)');
			console.log(this.timeBar.val)
		}
		requestAnimationFrame(e => this.player());
	}
	
	addEvent() {
		// 재생
		this.playCircleBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			this.play();
		})
		// 일시정지
		this.stopCircleBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			this.pause();
		})
		// 다음 음악 재생
		this.forwardBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			this.playNum++;
			if(this.app.playList.length == this.playNum) {
				this.playNum = this.app.playList.length - 1;
				return;
			}
			this.app.Audio.src = `/B/m/${this.app.playList[this.playNum].url}`;
			this.pause();
		})
		// 이전 음악 재생
		this.backwardBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			this.playNum--;
			if(0 > this.playNum) {
				this.playNum = 0;
				return;
			}
			this.app.Audio.src = `/B/m/${this.app.playList[this.playNum].url}`;
			this.pause();
		})
		
		// 가사보기
		this.viewLyricsBtn.addEventListener("click", ()=>{
			this.viewLyrics();
		})

		// 타임 슬라이드바
		this.timeBar.addEventListener("input", (e)=>{
			this.setVideoTime(e);
		})
		
		// 소리
		this.soundinput.oninput = () => {
			this.app.Audio.volume = this.soundinput.value / 10;
			this.soundPercent.innerHTML = `${Math.floor(this.soundinput.value * 10)}%`;
		}
	}

	//재생
	play() {
		this.app.Audio.play();
		this.playCircleBtn.style.display = "none";
		this.stopCircleBtn.style.display = "block";
	}

	//일시정지
	pause() {
		this.app.Audio.pause();
		this.playCircleBtn.style.display = "block";
		this.stopCircleBtn.style.display = "none";
	}

	viewLyrics() {
		if(this.app.playList[this.playNum].lyrics == null) return;
		
		this.reader = new FileReader();
		this.file = new File(`/B/선수제공파일(경남)/lyrics/${this.app.playList[this.playNum].lyrics}`);

		this.reader.onload = function () {
			output.innerText = this.reader.result;
		};

		console.log(this.file)
		
	}

	setVideoTime() {
		this.app.Audio.currentTime = this.timeBar.value * this.app.Audio.duration / 100;
	}
}

window.addEventListener("load", e =>{
	let app = new App();
	
});

