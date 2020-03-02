class App {
    constructor() {

		this.musicList = new Array;		
		this.nowMusic;
		this.beMusicList = false;
		this.playList = new Array;
		
		let player= new Player(this);

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
					console.log(this.playList)
				})
				if(this.playList.indexOf(this.nowMusic) != -1) return;
				this.playList.push(this.nowMusic)
				this.beMusicList = true;
			}
		})
		
	}
}

class Player { 
	constructor(app) {
		this.app = app;

		this.coverImg = document.querySelector(".cover-img");
		this.musicText = document.querySelector(".music-text");
		this.forwardBtn = document.querySelector(".fa-step-forward");
		this.circleBtn = document.querySelector(".fa-play-circle");
		this.backwardBtn = document.querySelector(".fa-step-backward");

		this.Audio = new Audio;
		new Promise((res,rej)=>{
			this.player();
			res();
		}).then(()=>{
			this.addEvent();
		});
	}

	player() {
		if(this.app.beMusicList) {
			this.coverImg.innerHTML = `<img src="/B/covers/${this.app.playList[0].albumImage}"></img>`
			this.musicText.innerHTML = `<p><span>${this.app.playList[0].name}</span><br>${this.app.playList[0].artist}</p>`
			this.Audio.src = `/B/m/${this.app.playList[0].url}`;
			this.Audio.currentTime = 0;
		}
		requestAnimationFrame(e => this.player());
	}
	
	addEvent() {
		// if(this.app.beMusicList) {
			this.circleBtn.addEventListener("click", ()=>{
				this.Audio.load();
				this.Audio.oncanplaythrough = ()=>{
					this.Audio.play();
				}
			})
			this.forwardBtn.addEventListener("click", ()=>{
				this.Audio.play()
			})
			this.backwardBtn.addEventListener("click", ()=>{
				this.Audio.play()
			})
		// }
	}
}

window.addEventListener("load", e =>{
	let app = new App();
});
