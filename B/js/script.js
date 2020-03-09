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
		this.bePlayList = false;
		this.playList = new Array;
		this.queueList = new Array;
		this.historyList = new Array;
		this.playNum = 0;
		
		let player= new Player(this);
		this.Audio = new Audio;

		this.declaration();
        
        this.init();
	}
	
	declaration() {
		this.page = document.querySelectorAll(".page");

		// dom
		this.contextmenu = document.querySelector("#contextmenu");
		this.playListMenu = document.querySelector("#playListMenu");
		this.newPlayList = document.querySelector(".newPlayList");
		this.newplayListForm = document.querySelector(".newplayListForm");
		this.playBtn = document.querySelectorAll(".play-btn > i");
		this.playListCloseBtn = document.querySelector(".fa-close");
		this.playListInput = document.querySelector("#playListInput");
		this.addPlayList = document.querySelector(".addPlayList");
		this.addPlayListBtn = document.querySelector("#addPlayListBtn")
		this.addPlayListButton = null;
		this.musicCard = document.querySelectorAll(".music > div > div");
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

	loading() {
		var loader = $(".loading-form");
		var section = $("section");
		loader.css("display","none");
		section.css("display","block");
	}
 
	// getDuration(dataUrl) {
	// 	return new Promise((res, rej)=>{
	// 		let audio = new Audio();
	// 		audio.src = `/B/m/${dataUrl}`;
	// 		audio.addEventListener("loadeddata", ()=>{
	// 			res(audio.duration);
	// 		})
	// 	})
	// }
	
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
				this.contextmenu.innerHTML = `<div class="add-play-list contextmenu">플레이리스트 추가</div>
											  <div class="next-music-play contextmenu">다음 음악으로 재생</div>
											  <div class="add-queue contextmenu">대기열 추가</div>`;
				event.preventDefault();
				this.contextmenu.style.height = '180px';
				this.contextmenu.style.top = e.pageY + "px";
				this.contextmenu.style.left = e.pageX + "px";
				this.contextmenu.style.display = 'block';
				this.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.classList[0]) this.nowMusic = list
				})
			})
		})

		this.playBtn.forEach(btn=>{
			btn.addEventListener("click", (e)=>{
				this.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.parentNode.parentNode.classList[0]) this.nowMusic = list
				})
				this.queueList = new Array;
				this.queueList.push(this.nowMusic)
				this.beMusicList = true;
				this.Audio.src = `/B/m/${this.queueList[0].url}`;
			})
		})

		this.contextmenu.addEventListener("click", (e)=>{
			if(e.target.classList[0] === "add-play-list") {				
				this.playListInput.value = '';
				this.viewPlayListMenu(e);
			} else if(e.target.classList[0] === "next-music-play") {
				this.nextPlay();
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
				if(list[0] == this.playListInput.value) {
					this.bePlayList = true;
				};
			})
			if(!this.bePlayList) {
				if(this.playListInput.value != ""){
					this.playList.push([this.playListInput.value, []]);
				}
				this.InnerPlayListMenu()
			}
			this.bePlayList = false;
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
				} else if(page.classList[2] === 'Home') {
					this.declaration();
					this.addEvent()
				}
			}
		})
	}

	viewPlayListMenu(e) {
		this.playListMenu.style.top = e.pageY + "px";
		this.playListMenu.style.left = e.pageX + "px";
		this.playListMenu.style.display = 'block';
		this.InnerPlayListMenu();
	}

	newPlayListForm(e) {
		this.playListMenu.style.top = e.pageY + "px";
		this.playListMenu.style.left = e.pageX + "px";
		this.playListMenu.style.display = 'block';
	}

	InnerPlayListMenu() {
		this.addPlayList.innerHTML = '';
		this.playList.forEach(list=>{
			let playList = document.createElement("div");
			let listData = `<div class="playList"><input type="checkbox" name="addPlayListButton" id="${list[0]}" class="addPlayListButton">${list[0]}</div>`;
			list[1].forEach(data=>{
				if(data == this.nowMusic) {
					listData = `<div class="playList"><input type="checkbox" name="addPlayListButton" id="${list[0]}" class="addPlayListButton" checked>${list[0]}</div>`;
				}
			})
			playList.innerHTML = listData;
			this.addPlayList.appendChild(playList)
		})

		this.addPlayListButton = document.querySelectorAll(".addPlayListButton");

		this.addPlayListButton.forEach((btn, i)=>{
			btn.addEventListener("change", (e)=>{
				if(e.target.checked) {
					let is = false;
					this.playList[i][1].forEach(list=>{
						if(list == this.nowMusic)
							is = true;
					})
					if(!is)
						this.playList[i][1].push(this.nowMusic)
				} else {
					this.playList[i][1].forEach((list, idx)=>{
						if(list == this.nowMusic)
							this.playList[i][1].splice(idx, 1)
					})
				}
				
			})
		})
	}
	
	nextPlay() {
		if(this.queueList.length == 0) {				
			if(this.queueList.indexOf(this.nowMusic) != -1) return;
			if(!this.beMusicList) {
				this.queueList.push(this.nowMusic)
				this.beMusicList = true;
				this.Audio.src = `/B/m/${this.queueList[0].url}`;
			} else {
				this.queueList.push(this.nowMusic)
			}
		} else {
			let isMusic = true;
			this.queueList.forEach(list=>{
				if(list == this.nowMusic)  isMusic = false;
			})
			if(isMusic)
				this.queueList.splice(this.playNum + 1, 0, this.nowMusic);
			isMusic = true;
		}
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
		this.playCircleBtn = document.querySelector(".music-player-top > .fa-play");
		this.stopCircleBtn = document.querySelector(".fa-pause");
		this.backwardBtn = document.querySelector(".fa-step-backward");
		this.soundinput = document.querySelector("#sound-set");
		this.soundPercent = document.querySelector(".sound-percent");
		this.repeatBtn = document.querySelector("#repeat-btn");

		this.repeatType = 'none';

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
				if(this.repeatType == 'one-repeat') {
					this.app.Audio.currentTime = 0;
					this.viewLyrics();
					this.play();
				}
				else if(this.app.playNum != this.app.queueList.length - 1) {
					this.app.playNum++;
					this.app.Audio.src = `/B/m/${this.app.queueList[this.app.playNum].url}`;
					this.app.Audio.currentTime = 0;
					this.viewLyrics();
					this.play();
				} else if(this.repeatType == 'queue-repeat') {
					this.app.playNum = 0;
					this.app.Audio.src = `/B/m/${this.app.queueList[this.app.playNum].url}`;
					this.app.Audio.currentTime = 0;
					this.viewLyrics();
					this.play();
				}
				this.lyricsNum = 0; 
			}

			this.lyricsScroll();
			this.lyricsHigh();

			this.timeBar.value = (this.app.Audio.currentTime * 100) / this.app.Audio.duration;

			var val = $('input[type=range]').val();
			$('input[type=range]').css('background', 'linear-gradient(to right, #ff8888 0%, #ff8888 '+ val +'%, #e4e4e4 ' + val + '%, #e4e4e4 ' + $('input[type=range]')[0].max + '%)');
		} else {
			this.coverImg.innerHTML = `<img src="" alt="">`
			this.musicText.innerHTML = ``
			this.nowTime.innerHTML = `0:00`
			this.allTime.innerHTML = `0:00`
		}
		requestAnimationFrame(e => this.player());
	}
	
	addEvent() {
		// 재생
		this.playCircleBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			console.log("Asd")
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
			if(this.repeatType == 'queue-repeat' && this.app.queueList.length == this.app.playNum) {
				this.app.playNum = 0;
			}
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

		// 반목재생
		this.repeatBtn.addEventListener("click", ()=>{
			if(!this.app.beMusicList) return;
			if(this.repeatBtn.value == '반복안함') {
				this.repeatBtn.value = '음악반복';
				this.repeatType = 'one-repeat';
			} else if(this.repeatBtn.value == '음악반복') {
				this.repeatBtn.value = '대기열반복';
				this.repeatType = 'queue-repeat';
			} else if(this.repeatBtn.value == '대기열반복') {
				this.repeatBtn.value = '반복안함';
				this.repeatType = 'none';
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

	// 재생
	play() {
		this.app.Audio.play();
		this.playCircleBtn.style.display = "none";
		this.stopCircleBtn.style.display = "block";
		this.lyrics.bool = true;
	}

	// 일시정지
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
		this.listNum = 0;
		this.init();
	}

	init() {
		if(this.app.queueList.length === 0) return;
		this.innerList();
		this.frame();
		this.addEvent();
	}
 
	innerList() {
		this.queueMain.innerHTML = '';
		this.app.queueList.forEach(queue=>{
			let list = document.createElement("div");
			list.id = queue.idx;
			list.classList.add("queue-music");
			let listData = `<img id="music-queue-list-cover" src="./covers/${queue.albumImage}" alt="">
							<div class="music-queue-list-title">${queue.name}</div>
							<div class="music-queue-list-artist">${queue.artist}</div>
							<div class="music-queue-list-pathos">${queue.albumName}</div>`;
							// <div class="music-queue-list-run-time">${queue.duration.time()}</div>`;
			list.innerHTML = listData;
			this.queueMain.appendChild(list)
		})
		this.highDiv = document.querySelectorAll(".music-queue-list-main > div");
		this.queueMusic = document.querySelectorAll(".queue-music");
	}

	addEvent() {
		this.queueMusic.forEach(music=>{
			music.addEventListener("contextmenu", (e)=>{
				this.app.contextmenu.innerHTML = `<div class="add-play-list contextmenu">플레이리스트 추가</div>
											  <div class="delete-queue contextmenu">대기열에서 삭제</div>`;
				event.preventDefault();
				this.app.contextmenu.style.height = '120px';
				this.app.contextmenu.style.top = e.pageY + "px";
				this.app.contextmenu.style.left = e.pageX + "px";
				this.app.contextmenu.style.display = 'block';
				
				this.app.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.id) this.app.nowMusic = list;
				})
			})
		})

		this.app.contextmenu.addEventListener("click", (e)=>{
			if(e.target.classList[0] === "add-play-list") {				
				this.app.playListInput.value = '';
				this.app.viewPlayListMenu(e);
			} else if(e.target.classList[0] === "delete-queue") {		
				this.deleteQueue();
				this.app.beMusicList = false;
			}
		})
	}
	
	highLight() {
		this.highDiv.forEach(div=>{
			div.style.border = 'none';
		})
		this.highDiv[this.app.playNum].style.border = "2px solid rgb(255, 90, 90)";
	}

	deleteQueue() {
		this.app.queueList.splice(this.app.queueList.indexOf(this.app.playNum),1);
		this.innerList();
	}

	frame() {
		if(this.app.queueList.length == 0) return;
		this.highLight();
		
		requestAnimationFrame(e => this.frame());
	}
}

class Library {
	constructor(app) {
		this.app = app;

		this.musicHistoryList = document.querySelector(".music-history-list");
		this.musicPlayListMain = document.querySelector(".music-play-list-main");

		this.init();
		this.addEvent();
	}

	init() {
		this.frame();
		if(this.app.historyList.length != 0) {
			this.innerSectionHistoryData();
		}
		if(this.app.playList.length != 0)
			this.innerSectionPlayListData();
	}

	innerSectionHistoryData() {
		for(let i = this.app.historyList.length - 1; i > this.app.historyList.length - 6; i--) {
			if(i >= 0) {
				let list = document.createElement("div");
				list.classList.add("history-music");
				let listData = `<img id="music-history-list-cover" src="./covers/${this.app.historyList[i].albumImage}" alt="">
								<div class="music-history-list-title">${this.app.historyList[i].name}</div>
								<div class="music-history-list-artist">${this.app.historyList[i].artist}</div>
								<div class="music-history-list-pathos">${this.app.historyList[i].albumName}</div>`;
								// <div class="music-history-list-run-time">${this.app.historyList[i].duration.time()}</div>`;
				list.innerHTML = listData;
				this.musicHistoryList.appendChild(list)
				this.historyMusic = document.querySelectorAll(".history-music");
			}
		}

		this.historyMusic.forEach(music=>{
			music.addEventListener("contextmenu", (e)=>{
				this.app.contextmenu.innerHTML = `
												  <div class="next-music-play contextmenu">재생기록 삭제</div>
												  <div class="add-play-list contextmenu">플레이리스트 추가</div>
												  <div class="next-music-play contextmenu">다음 음악으로 재생</div>
												  <div class="add-queue contextmenu">대기열에 추가</div>`;
				event.preventDefault();
				this.app.contextmenu.style.height = '240px';
				this.app.contextmenu.style.top = e.pageY + "px";
				this.app.contextmenu.style.left = e.pageX + "px";
				this.app.contextmenu.style.display = 'block';
				
				this.app.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.id) this.app.nowMusic = list;
				}) 
			})
		})
	}

	innerSectionPlayListData() {
		this.musicPlayListMain.innerHTML = '';
		this.app.playList.forEach((playList, i)=>{
			let list = document.createElement("div");
			list.id = i;
			list.classList.add("playList-card");
			let playListData = `
				<img id="music-play-list-cover" src="./covers/${playList[1][0].albumImage}" alt="">
				<div class="music-play-list-title"><a id="${i}" class="playListPageBtn ${playList[0]} playlist" href="#"> - ${playList[0]} <span class="playlist">(${playList[1].length})</span></a></div>`;
			list.innerHTML = playListData;
			this.musicPlayListMain.appendChild(list); 
			this.playListPageBtn = document.querySelectorAll(".playListPageBtn");

			this.playListCard = document.querySelectorAll(".playList-card");
		})

		this.playListPageBtn.forEach(btn=>{
			btn.addEventListener("click", (e)=>{
				this.movePage(e.target);
			})
		})

		this.playListCard.forEach(music=>{
			music.addEventListener("contextmenu", (e)=>{
				this.app.contextmenu.innerHTML = `<div class="play-playList contextmenu">플레이리스트 재생</div>
												  <div class="add-play-lists contextmenu">플레이리스트에 추가</div>
												  <div class="next-musics-play contextmenu">다음 음악으로 재생</div>
												  <div class="add-queues contextmenu">대기열에 추가</div>
												  <div class="delete-playList contextmenu">플레이리스트 삭제</div>`;
				event.preventDefault();
				this.app.contextmenu.style.height = '300px';
				this.app.contextmenu.style.top = e.pageY - 300 + "px";
				this.app.contextmenu.style.left = e.pageX + "px";
				this.app.contextmenu.style.display = 'block';
				
				this.app.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.id) this.app.nowMusic = list;
				}) 
				this.playListNum = e.currentTarget.id;
			})
		})
	}

	movePage(e) {
		$.ajax({
			url: `${e.classList[2]}.html`,
			method: 'get',
			success: (data)=>{
				let section = document.querySelector("section");
				section.innerHTML = data;
				let playList = new PlayList(this.app, this, e.id);
			}
		})
	}

	addEvent() {
		this.app.contextmenu.addEventListener("click", (e)=>{
			if(e.target.classList[0] === "add-play-list") {				
				this.app.playListInput.value = '';
				this.app.viewPlayListMenu(e);
			} else if(e.target.classList[0] === "next-musics-play") {
				if(this.app.queueList.length == 0) {				
					this.app.playList.forEach(playList=>{
						if(playList[0] == this.app.playList[this.playListNum][0]) {
							playList[1].forEach(music=>{
								this.app.queueList.push(music);
								this.app.beMusicList = true;
								this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
							})
						}
					})
				} else {
					let isMusic = false;
					this.app.playList.forEach(playList=>{
						if(playList[0] == this.app.playList[this.playListNum][0]) {
							playList[1].forEach(music=>{
								this.app.queueList.forEach(queue=>{
									if(music == queue) isMusic = true
								})
							})
							if(!isMusic) {
								playList[1].forEach((music, i)=>{
									this.app.queueList.splice(this.app.playNum + i + 1, 0, music);
								})
							}
						}
					})
				}
			} else if(e.target.classList[0] === "add-queues") {				
				let isMusic = false;
				this.app.playList.forEach(playList=>{
					if(playList[0] == this.app.playList[this.playListNum][0]) {
						playList[1].forEach(music=>{
							this.app.queueList.forEach(queue=>{
								if(music == queue) isMusic = true
							})
						})
						if(!isMusic) {
							playList[1].forEach(music=>{
								console.log(music)
								this.app.queueList.push(music);
								this.app.beMusicList = true;
								this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
							})
						}
					}
				})
			} else if(e.target.classList[0] === 'delete-playList') {
				this.app.playList.splice(this.playListNum,1);
				this.musicPlayListMain.innerHTML = ``;
				if(this.app.playList.length != 0) {
					this.innerSectionPlayListData();
				}
			} else if(e.target.classList[0] === 'play-playList') {
				this.app.queueList = new Array;
				this.app.playList.forEach(playList=>{
					if(playList[0] == this.app.playList[this.playListNum][0]) {
						playList[1].forEach(music=>{
							this.app.queueList.push(music);
							this.app.beMusicList = true;
							this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
						})
					}
				})
			} else if(e.target.classList[0] === 'add-play-lists') {
				this.app.playListInput.value = '';
				
				this.app.playListMenu.style.top = e.pageY + "px";
				this.app.playListMenu.style.left = e.pageX + "px";
				this.app.playListMenu.style.display = 'block';
				this.app.addPlayList.innerHTML = '';
				this.app.playList.forEach(list=>{
					let playList = document.createElement("div");
					let listData = `<div class="playList"><input type="checkbox" name="addPlayListButton" id="${list[0]}" class="addPlayListButton">${list[0]}</div>`;
					list[1].forEach(data=>{
						if(data == this.nowMusic) {
							listData = `<div class="playList"><input type="checkbox" name="addPlayListButton" id="${list[0]}" class="addPlayListButton" checked>${list[0]}</div>`;
						}
					})
					playList.innerHTML = listData;
					this.app.addPlayList.appendChild(playList)
				})

				this.addPlayListButton = document.querySelectorAll(".addPlayListButton");

				this.addPlayListButton.forEach((btn, i)=>{
					btn.addEventListener("change", (e)=>{
						if(e.target.checked) {
							let is = false;
							this.app.playList.forEach(playList=>{
								if(playList[0] == this.app.playList[this.playListNum][0]) {
									playList[1].forEach(music=>{
										if(music == this.nowMusic)
											is = true;
									})
								}
							})
							this.app.playList.forEach(playList=>{
								if(playList[0] == this.app.playList[this.playListNum][0]) {
									playList[1].forEach(music=>{
										if(!is) {
											let tf = true
											this.app.playList[i][1].forEach(data=>{
												if(data === music) {
													tf = false;
												}
											})
											if(tf)
												this.app.playList[i][1].push(music)
										}
									})
								}
							})
						} else {
							this.app.playList.forEach(playList=>{
								if(playList[0] == this.app.playList[this.playListNum][0]) {
									playList[1].forEach(music=>{
										this.app.playList[i][1].splice(this.app.playList[i][1].indexOf(music), 1)
									})
								}
							})
						}
						this.innerSectionPlayListData();
					})
				})
			}
		})
	}

	frame() {

		requestAnimationFrame(e=> this.frame());
	}
}

class PlayList {
	constructor(app, library, playListNum) {
		this.app = app;
		this.library = library;
		this.playListNum = playListNum;

		this.musicRecommendation = document.querySelector(".music-recommendation > div");
		this.musicRecommendationP = document.querySelector(".music-recommendation > p");
		this.allPlay = document.querySelector(".all-play");
		this.addPlay = document.querySelector(".add-play");

		this.innerList();
		this.addEvent();
	}

	innerList() {
		this.musicRecommendation.innerHTML = ``;
		this.musicRecommendationP.innerHTML = `${this.app.playList[this.playListNum][0]} (노래 - <span>${this.app.playList[this.playListNum][1].length}</span>)`
		this.app.playList[this.playListNum][1].forEach(data=>{
			let music = document.createElement("div");
			music.id = data.idx;
			music.classList.add("playList-card")
			let musicData = `<img src="./covers/${data.albumImage}" alt="">
							<p><span>${data.name}</span><br>
							${data.artist}</p>`;
			music.innerHTML =  musicData;
			this.musicRecommendation.appendChild(music);
		})

		this.playListMusic = document.querySelectorAll(".playList-card");
	}

	addEvent() {
		this.allPlay.addEventListener("click", ()=>{
			this.app.queueList = new Array;
			this.app.playList.forEach(playList=>{
				console.log(playList[0], this.app.playList[this.playListNum][0])
				if(playList[0] == this.app.playList[this.playListNum][0]) {
					playList[1].forEach(music=>{
						this.app.queueList.push(music);
						this.app.beMusicList = true;
						this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
					})
				}
			})
		})

		this.addPlay.addEventListener("click", ()=>{
			let isMusic = false;
			this.app.playList.forEach(playList=>{
				playList[1].forEach(music=>{
					this.app.queueList.forEach(queue=>{
						if(music == queue) isMusic = true;
					})
				})

				if(!isMusic) {
					playList[1].forEach(music=>{
						this.app.queueList.push(music);
						this.app.beMusicList = true;
						this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
					})
				}
			})
		})

		this.playListMusic.forEach(music=>{
			music.addEventListener("contextmenu", (e)=>{
				this.app.contextmenu.innerHTML = `<div class="add-play-list contextmenu">플레이리스트 추가</div>
												  <div class="next-music-play contextmenu">다음 음악으로 재생</div>
												  <div class="add-queue contextmenu">대기열에 추가</div>
												  <div class="delete-playList contextmenu">플레이리스트 삭제</div>`;
				event.preventDefault();
				this.app.contextmenu.style.height = '240px';
				this.app.contextmenu.style.top = e.pageY + "px";
				this.app.contextmenu.style.left = e.pageX + "px";
				this.app.contextmenu.style.display = 'block';
				
				this.app.musicList.forEach(list=>{
					if(list.idx === e.currentTarget.id) this.app.nowMusic = list;
				}) 
			})
		})

		this.app.contextmenu.addEventListener("click", (e)=>{
			if(e.target.classList[0] === "add-play-list") {				
				this.app.playListInput.value = '';
				this.app.viewPlayListMenu(e);
			} else if(e.target.classList[0] === "next-music-play") {
				this.app.nextPlay();
			} else if(e.target.classList[0] === "add-queue") {				
				if(this.app.queueList.indexOf(this.app.nowMusic) != -1) return;
				if(!this.app.beMusicList) {
					this.app.queueList.push(this.app.nowMusic)
					this.app.beMusicList = true;
					this.app.Audio.src = `/B/m/${this.app.queueList[0].url}`;
				} else {
					this.app.queueList.push(this.app.nowMusic)
				}
			} else if(e.target.classList[0] === 'delete-playList') {
				this.app.playList.forEach(playList=>{
					playList[1].splice(playList[1].indexOf(this.app.nowMusic),1);
				})
				this.innerList();
			}
		})
	}
}

window.addEventListener("load", e =>{
	let app = new App();
});