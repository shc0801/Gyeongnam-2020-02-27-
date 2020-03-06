Number.prototype.time = function(){
    let min = parseInt(this / 60);
    let sec = parseInt(this % 60);
    if(sec < 10) sec = "0" + sec;

    return `${min}:${sec}`;
};

String.prototype.lyricsTime = function(){
	let reg = /(?<h>[0-9]{2}):(?<m>[0-9]{2}):(?<s>[0-9]{2}),(?<ms>[0-9]{3})/;
	let startTime = reg.exec(this).groups;

	return parseInt(startTime.m) * 60 + parseInt(startTime.s) + parseFloat(`0.${startTime.ms}`);
}

class App {
    constructor() {
		this.musicList = new Array;		
		this.nowMusic;
		this.beMusicList = false;
		this.playList = new Array;
		this.queueList = new Array;
		this.historyList = new Array;
		this.playNum = 0;
		
		let player= new Player(this);
		this.Audio = new Audio;

		this.page = document.querySelectorAll(".page");

		// dom
		this.contextmenu = document.querySelector("#contextmenu");
		this.playListMenu = document.querySelector("#playListMenu");
		this.newPlayList = document.querySelector(".newPlayList");
		this.newplayListForm = document.querySelector(".newplayListForm");
		this.playListCloseBtn = document.querySelector(".fa-close");
		this.playListInput = document.querySelector("#playListInput");
		this.addPlayListBtn = document.querySelector("#addPlayListBtn")
		this.musicCard = document.querySelectorAll(".music > div > div");
        
        this.init();
    }

    init() {
		new Promise((res,rej)=>{
			$.getJSON('js/music_list.json', async (data) =>{
				// for(let x of data) {
				// 	x.duration = await this.getDuration(x.url);
				// }
				localStorage.setItem("data", JSON.stringify(data));
				data.forEach(music => {
					this.musicList.push(music);
				});
				res();
			})
		}).then(()=>{
			// this.loading();
			this.addEvent();
		});
	}

	// loading() {
	// 	var loader = $(".loading-form");
	// 	var section = $("section");
	// 	loader.css("display","none");
	// 	section.css("display","block");
	// }
 
	getDuration(dataUrl) {
		return new Promise((res, rej)=>{
			let audio = new Audio();
			audio.src = `/B/m/${dataUrl}`;
			audio.addEventListener("loadeddata", ()=>{
				res(audio.duration);
			})
		})
	}
	
	addEvent(){ 

		// mouseEvent

		this.page.forEach(page=>{
			page.addEventListener("click", ()=>{
				this.pageChange(page);
			})
		})

		window.addEventListener("click", (e)=>{
			this.contextmenu.style.display = 'none';
		})

		this.musicCard.forEach(music=>{
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
				if(this.queueList.indexOf(this.nowMusic) != -1) return;
				this.viewPlayListMenu(e);
			} else if(e.target.classList[0] === "next-music-play") {

			} else if(e.target.classList[0] === "add-queue") {				
				if(this.queueList.indexOf(this.nowMusic) != -1) return;
				if(!this.beMusicList) {
					this.queueList.push(this.nowMusic)
					this.beMusicList = true;
					this.Audio.src = `/B/m/${this.queueList[0].url}`;
				} else {
					this.queueList.push(this.nowMusic)
				}
			}
		})

		this.newPlayList.addEventListener("click", (e)=>{
			this.newplayListForm.style.display = "block";
		})

		this.playListCloseBtn.addEventListener("click", ()=>{
			this.playListMenu.style.display = "none";
			this.newplayListForm.style.display = "none";
		})

		this.addPlayListBtn.addEventListener("click", ()=>{
			this.playList.forEach(list=>{
				console.log(list, this.playListInput.value)
				if(list == this.playListInput.value) return;
			})
			this.playList.push(this.playListInput.value);
			console.log(this.playList)
		})
	}

	pageChange(page) {
		$.ajax({
			url: `${page.classList[2]}.html`,
			method: 'get',
			success: (data)=>{
				let section = document.querySelector("section");
				section.innerHTML = data;
				if(page.classList[2] === 'Queue') {
					let queue = new Queue(this);
				} else if(page.classList[2] === 'Library') {
					let library = new Library(this);
				}
			}
		})
	}

	viewPlayListMenu(e) {
		this.playListMenu.style.top = e.pageY + "px";
		this.playListMenu.style.left = e.pageX + "px";
		this.playListMenu.style.display = 'block';
	}

	newPlayListForm(e) {
		this.playListMenu.style.top = e.pageY + "px";
		this.playListMenu.style.left = e.pageX + "px";
		this.playListMenu.style.display = 'block';
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

		this.lyrics = {
			startTime: new Array,
			endTime: new Array,
			lyricsNum: new Array,
			bool: false,
			scroll: true,
		};
		
		this.lyricForm = document.querySelector("#lyric-form");
		this.lyricsNum = 0;

		new Promise((res,rej)=>{
			this.player();
			res();
		}).then(()=>{
			this.addEvent();
		});
	} 

	player() {
		if(this.app.beMusicList) {
			this.coverImg.innerHTML = `<img src="/B/covers/${this.app.queueList[this.app.playNum].albumImage}"></img>`
			this.musicText.innerHTML = `<p><span>${this.app.queueList[this.app.playNum].name}</span><br>${this.app.queueList[this.app.playNum].artist}</p>`
			this.nowTime.innerHTML = this.app.Audio.currentTime.time();
			this.allTime.innerHTML = this.app.Audio.duration.time();

			if(this.app.Audio.currentTime == this.app.Audio.duration) {
				this.pause();
				if(this.app.playNum != this.app.queueList.length - 1) {
					this.app.playNum++;
					this.app.Audio.src = `/B/m/${this.app.queueList[this.app.playNum].url}`;
					this.app.Audio.currentTime = 0;
					this.viewLyrics();
					this.play();
				}	
			}

			this.lyricsScroll();
			this.lyricsHigh();

			this.timeBar.value = (this.app.Audio.currentTime * 100) / this.app.Audio.duration;

			var val = $('input[type=range]').val();
			$('input[type=range]').css('background', 'linear-gradient(to right, #ff8888 0%, #ff8888 '+ val +'%, #e4e4e4 ' + val + '%, #e4e4e4 ' + $('input[type=range]')[0].max + '%)');
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
			this.app.playNum++;
			if(this.app.queueList.length == this.app.playNum) {
				this.app.playNum = this.app.queueList.length - 1;
				return;
			}
			this.app.Audio.src = `/B/m/${this.app.queueList[this.app.playNum].url}`;
			this.pause();
			this.viewLyrics();
		})
		// 이전 음악 재생
		this.backwardBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			if(this.app.Audio.currentTime < 5) {
				this.app.playNum--;
				if(0 > this.app.playNum) {
					this.app.playNum = 0;
					return;
				}
				this.app.Audio.src = `/B/m/${this.app.queueList[this.app.playNum].url}`;
				this.pause();
				this.viewLyrics();
			} else {
				this.replay()
			}
		})

		// 재생기록 저장
		this.app.Audio.addEventListener("loadeddata", ()=>{
			this.app.historyList.push(this.app.queueList[this.app.playNum]);
		})
		
		// 가사보기
		this.viewLyricsBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			if(this.lyricForm.style.display == 'none' || this.lyricForm.style.display == "") {
				this.lyricForm.style.display = 'block'
				this.viewLyricsBtn.style.backgroundColor = "rgb(255, 77, 77)";
			} else if(this.lyricForm.style.display == 'block') {
				this.lyricForm.style.display = 'none'
				this.viewLyricsBtn.style.backgroundColor = "rgb(255, 175, 206)";
			}
			this.viewLyrics();
		})

		// 가사부분 휠스크롤

		this.lyricForm.addEventListener("mousewheel", ()=>{
			this.lyrics.scroll = false;
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
		this.lyrics.bool = true;
	}

	//일시정지
	pause() {
		this.app.Audio.pause();
		this.playCircleBtn.style.display = "block";
		this.stopCircleBtn.style.display = "none";
		this.lyrics.bool = false;
	}

	//
	replay() {
		this.app.Audio.currentTime = 0;
	}

	viewLyrics() {
		if(this.app.queueList[this.app.playNum].lyrics == null) {
			this.lyricForm.innerHTML = "";
			let p = document.createElement("p");
			p.innerText = "가사가 존재하지 않습니다";
			this.lyricForm.appendChild(p)
			return;
		}
		this.lyricForm.scroll({ top:0 });
		$.ajax({
			url: `lyrics/${this.app.queueList[this.app.playNum].lyrics}`,
			method: 'get',
			success:(data)=>{
				let lyricsData = /(?<lyricsNum>[0-9]+)\s*(?<startTime>[0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*-->\s*(?<endTime>[0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3})\s*(?<lyric>[^\r\n]+)/
				this.lyrics = {
					startTime: new Array,
					endTime: new Array,
					lyricsNum: new Array,
					bool: false,
					scroll: true
				};
				this.lyricForm.innerHTML = "";
				while(lyricsData.test(data)) {
					let groups = lyricsData.exec(data).groups;
					
					data = data.substr(data.indexOf(groups.lyric) + groups.lyric.length);

					let p = document.createElement("p");
					p.id = `lyric-${groups.lyricsNum}`;
					p.innerText = groups.lyric;
					this.lyricForm.appendChild(p)

					this.lyrics.startTime.push(groups.startTime.lyricsTime());
					this.lyrics.endTime.push(groups.endTime.lyricsTime())
					this.lyrics.lyricsNum.push(groups.lyricsNum);
				}
			}
		})  
	}

	lyricsHigh() {
		if(this.app.Audio.currentTime >= this.lyrics.startTime[this.lyricsNum]) {
			$(`#lyric-${this.lyrics.lyricsNum[this.lyricsNum]}`).contents().unwrap().wrap( `<span id="lyric-${this.lyrics.lyricsNum[this.lyricsNum]}"></span>` );
			if(this.app.Audio.currentTime >= this.lyrics.startTime[this.lyricsNum + 1]) {
				$(`#lyric-${this.lyrics.lyricsNum[this.lyricsNum]}`).contents().unwrap().wrap( `<p id="lyric-${this.lyrics.lyricsNum[this.lyricsNum]}"></p>` );
				this.lyricsNum++;
			}
		}
	}

	lyricsScroll() {
		if(!this.lyrics.scroll) return;
		let highlight = document.querySelector(`#lyric-${this.lyrics.lyricsNum[this.lyricsNum]}`);
		if(highlight == null) return;
		if(-600 > this.lyricForm.scrollTop - highlight.offsetTop ){
			this.lyricForm.scroll({
				behavior: 'auto',
				left: 0,
				top:highlight.offsetTop - 170
			});
		} else if( 600 < this.lyricForm.scrollTop - highlight.offsetTop ) {
			this.lyricForm.scroll({
				behavior: 'auto',
				left: 0,
				top:highlight.offsetTop - 170
			});
		} else {
			this.lyricForm.scroll({
				behavior: 'smooth',
				left: 0,
				top:highlight.offsetTop - 170
			});
		}
	}

	setVideoTime() {
		this.app.Audio.currentTime = this.timeBar.value * this.app.Audio.duration / 100;
		$(`#lyric-${this.lyrics.lyricsNum[this.lyricsNum]}`).contents().unwrap().wrap( `<p id="lyric-${this.lyrics.lyricsNum[this.lyricsNum]}"></p>` );
		this.lyricsNum = 0;
	}
}

class Queue {
	constructor(app) {
		this.app = app;
		
		this.queueMain = document.querySelector(".music-queue-list-main");
		// this.queueList = {
		// 	title: queueList[0],
		// 	artist: queueList[1],
		// 	albumName: queueList[2],
		// 	runTime: queueList[3],
		// }
		this.listNum = 0;
		this.init();
	}

	init() {
		this.innerList();
		this.frame();
	}
 
	innerList() {
		this.app.queueList.forEach(queue=>{
			let list = document.createElement("div");
			let listData = `<img id="music-queue-list-cover" src="./covers/${queue.albumImage}" alt="">
							<div class="music-queue-list-title">${queue.name}</div>
							<div class="music-queue-list-artist">${queue.artist}</div>
							<div class="music-queue-list-pathos">${queue.albumName}</div>
							<div class="music-queue-list-run-time">${queue.duration.time()}</div>`;
			list.innerHTML = listData;
			this.queueMain.appendChild(list)
		})
		this.highDiv = document.querySelectorAll(".music-queue-list-main > div");
	}
	
	highLight() {
		this.highDiv.forEach(div=>{
			div.style.border = 'none';
		})
		this.highDiv[this.app.playNum].style.border = "2px solid rgb(255, 90, 90)";
	}

	frame() {
		this.highLight();
		
		requestAnimationFrame(e => this.frame());
	}
}

class Library {
	constructor(app) {
		this.app = app;

		this.musicHistoryList = document.querySelector(".music-history-list");

		this.init();
	}

	init() {
		this.frame();
		this.innerSectionData();
	}

	innerSectionData() {
		for(let i = this.app.historyList.length - 1; i > this.app.historyList.length - 6; i--) {
			console.log(this.app.historyList[i])
			let list = document.createElement("div");
			let listData = `<img id="music-history-list-cover" src="./covers/${this.app.historyList[i].albumImage}" alt="">
							<div class="music-history-list-title">${this.app.historyList[i].name}</div>
							<div class="music-history-list-artist">${this.app.historyList[i].artist}</div>
							<div class="music-history-list-pathos">${this.app.historyList[i].albumName}</div>`;
							// <div class="music-history-list-run-time">${this.app.historyList[i].duration.time()}</div>`;
			list.innerHTML = listData;
			this.musicHistoryList.appendChild(list)
		}
	}

	frame() {

		requestAnimationFrame(e=> this.frame());
	}
}

window.addEventListener("load", e =>{
	let app = new App();
});

