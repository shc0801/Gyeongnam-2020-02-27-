class App {
    constructor() {

		this.musicList = new Array;		
		this.nowMusic;
		this.playList = new Array;
		this.playList[0] = null;
		
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
			if(e.target.classList[1] === 'contextmenu') return;
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
				if(this.playList[0] === null) this.playList[0] = this.nowMusic;
				else this.playList.push(this.nowMusic);
			}
		})
		
	}
}

class Player { 
	constructor(app) {
		this.app = app

		this.coverImg = document.querySelector(".cover-img");
		this.musicText = document.querySelector(".music-text");
		this.player();
	}

	player() {
		console.log(this.app.playList)
		

		console.log(this.app.playList[0])
		// this.coverImg.innerHTML = `<img src="${}"></img>`

		requestAnimationFrame(e => this.player());
	}
	
}

window.addEventListener("load", e =>{
	let app = new App();
});