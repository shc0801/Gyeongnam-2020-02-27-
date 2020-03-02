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

		this.forwardBtn = document.querySelector(".fa-step-forward");
		this.playCircleBtn = document.querySelector(".fa-play-circle");
		this.stopCircleBtn = document.querySelector(".fa-stop");
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
		}
		requestAnimationFrame(e => this.player());
	}
	
	addEvent() {
		// if(this.app.beMusicList) {
		this.playCircleBtn.addEventListener("click", ()=>{
			this.app.Audio.load();
			this.app.Audio.oncanplaythrough = ()=>{
				this.app.Audio.play();
			}
			this.playCircleBtn.style.display = "none";
			this.stopCircleBtn.style.display = "block";
		})
		this.stopCircleBtn.addEventListener("click", ()=>{
			this.pause();
		})
		this.forwardBtn.addEventListener("click", ()=>{
			this.playNum++;
			console.log(this.app.playList.length)
			if(this.app.playList.length == this.playNum) {
				this.playNum = this.app.playList.length - 1;
				return;
			}
			this.app.Audio.src = `/B/m/${this.app.playList[this.playNum].url}`;
			this.pause();
		})
		this.backwardBtn.addEventListener("click", ()=>{
			this.playNum--;
			if(0 > this.playNum) {
				this.playNum = 0;
				return;
			}
			this.app.Audio.src = `/B/m/${this.app.playList[this.playNum].url}`;
			this.pause();
		})
		this.soundinput.oninput = () => {
			this.app.Audio.volume = this.soundinput.value / 10;
			this.soundPercent.innerHTML = `${Math.floor(this.soundinput.value * 10)}%`;
		}
		// }
	}

	pause() {
		this.app.Audio.pause();
		this.playCircleBtn.style.display = "block";
		this.stopCircleBtn.style.display = "none";
	}
}

window.addEventListener("load", e =>{
	let app = new App();
});
