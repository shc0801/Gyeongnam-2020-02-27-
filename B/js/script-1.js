const $document = $(document);

Array.prototype.search = function(fnc) {
	let result = [];
	this.forEach((item,i)=>{
		if (fnc(item,i)) {
			result.push(i);
		}
	})
	return result;
}

const ls = localStorage
function save(key,val) {
	return ls.setItem(key,JSON.stringify(val))
}
function load(key) {
	return ls.getItem(key) || false
}


var Loader = {
	init: function() {
		this.$wrapper = $('.wrapper');

		let url = load('url') || './home.html'
		this.loadPage(false,url)
	},
	initEvent: function() {
		$document.on('click.loader','.js-change-page',e=>{
			this.loadPage(e);
		})
	},
	loadHomePage: function() {
		$.ajax({
			url: '/home.html',
			cache: false,
			success: data=>{
				this.$wrapper.html(data);
			}
		})
	},
	loadPage: function(e, url = false) {
		let link = url || e.currentTarget.dataset.link
		history.pushState(link,link,link)
		$.ajax({
			url: link,
			cache: false,
			success: data=>{
				this.$wrapper.html(data);
				if (link == './queue.html') {
					this.loadQueue();
				}
			}
		})
	},
	loadQueue: function() {
		console.log(Queue.queue);
		let $list = $('.queue-list');
		let $cover = $('.queue-img')

		$list.html('<caption class="queue-title">대기열</caption>')

		if (Queue.queue.length < 1) {
			console.log($list);
			$list.append(`<tr class="queue-item"><td class="queue-empty">대기열에 음악이 없습니다!</td></tr>`)
			$cover.attr('style','display: none;');
		} else {
			$cover.attr('style',`display: block;`);
			$cover.attr('src',`./img/${Queue.queue[Queue.cursor].albumImage}`);
			$cover.attr('alt',Queue.queue[Queue.cursor].albumName);
		}


		let temp = Queue.queue.reverse();
		temp.forEach((item,i)=>{
			$list.append(`
				<tr class="queue-item">
					<td class="queue-item-img-wrap">
						<img class="queue-item-img" src="/covers/${item.albumImage}" alt="${item.albumName}" />
					</td>
					<td class="queue-item-text">
						<div class="queue-item-title">${item.albumName}</div>
						<div class="queue-item-artist">${item.artist}</div>
					</td>
					<td class="queue-item-time"></td>
				</tr>
			`)
		})
	}
}

var ContextMenu = {
	preset: [
		'js-view-playlist','js-music-insert','js-music-enqueue',
	],
	innerText: [
		'플레이리스트에 추가','다음 음악으로 재생','대기열에 추가'
	],
	init: function() {
		this.music = null;
	},
	initEvent: function() {
		$document.on('contextmenu', '.js-ctxm-music', e=>{
			e.preventDefault();
			this.setMusic(e);
			this.openMenu(e);
		})
		$document.on('mousedown.contextMenu', '.js-view-playlist',e=>{
			this.openPlaylist(e);
		})
		$document.on('mousedown wheel',e=>{
			if ($(e.target).is('.js-view-playlist')) {
				return;
			}
			this.closeMenu(e);
		})
	},
	genMenu: function(idxs) {
		let result = "";
		for (var i = 0; i < idxs.length; i++) {
			let idx = idxs[i]
			result += `<div class="ctxMenu-inner ${this.preset[i]}" data-music-idx="${this.music}">${this.innerText[i]}</div>`;
		}
		return result;
	},
	setMusic: function(e) {
		this.music = e.currentTarget.dataset.musicIdx;
	},
	openMenu: function(e) {
		let inner = e.currentTarget.dataset.menuInners;

		let div = document.createElement('div')
		div.classList.add('ctxMenu')
		div.innerHTML = this.genMenu(inner.split(','));
		div.style.left = e.clientX+"px"
		div.style.top = e.clientY+"px"
		document.body.appendChild(div);
	},
	closeMenu: function(e) {
		$('.ctxMenu').remove();
	},
	openPlaylist: function(e) {
		let result = "";
		result += `<div class="ctxMenu-inner js-open-makeModal"> + 새 플레이리스트</div>`
		playlist.forEach((item,i)=>{
			result += `<div class="ctxMenu-inner js-add-playlist" data-playlist-idx="${item.idx}">${item.name}</div>`;
		})
		
		let div = document.createElement('div')
		div.classList.add('ctxMenu')
		div.innerHTML = result
		div.style.left = e.clientX+"px"
		div.style.top = e.clientY+"px"
		this.closeMenu();
		document.body.appendChild(div);
	}
}

var Queue = {
	init: function() {
		this.queue = []
		this.cursor = 0
	},
	initEvent: function() {

		function chkContext(e) {
			return e.button == 2;
		}

		$document.on('mousedown.queue','.js-music-play',e=>{
			if(chkContext(e)) {
				return;
			}
			this.play(e);
		})
		$document.on('mousedown.queue','.js-music-enqueue',e=>{
			console.log(e.button);
			if(chkContext(e)) {
				return;
			}
			this.enqueue(e);
		})
		$document.on('mousedown.queue','.js-music-insert',e=>{
			console.log(e.button);
			if(chkContext(e)) {
				return;
			}
			this.insert(e);
		})
		$document.on('mousedown.queue','.js-music-delete',e=>{
			console.log(e.button);
			if(chkContext(e)) {
				return;
			}
			this.delete(e);
		})
	},
	insert: function(e) {
		// if (this.queue.length < 1) {this.enqueue(e); return;}
		this.queue.splice(this.cursor,0,new Music(e.currentTarget.dataset.musicIdx))
	},
	enqueue: function(e) {
		this.queue.push(new Music(e.currentTarget.dataset.musicIdx))
	},
	play: function(e) {
		this.deleteQueue();
		this.queue = [new Music(e.currentTarget.dataset.musicIdx)];
	},
	deleteQueue: function() {
		Player.stop();
		this.queue = [];
	},
}

var Player = {
	init: function() {

	},
	initEvent: function() {

	},
	play: function() {

	},
	stop: function() {

	},
}

class Music {
	constructor(idx) {
		let music = this.loadMusic(idx);
		for (let key in music) {
			this[key] = music[key];
		}
	}
	loadMusic(idx) {
		let result = null;
		musicList.forEach((item,i)=>{
			if (item.idx == idx) {
				result = item;
			}
		})
		if (result == null) {
			throw new Error("unknown idx:"+idx);
		}
		return result;
	}
}

var playlist = [];
var PlayListController = {
	init: function() {
		playlist = JSON.parse(load('playlist'));
		this.$modal = $('#playlists');
		this.$makeModal = $('.makeModal');
		this.$input = $('.makeModal-input');
		this.$playlist = $('.js-playlists');
		this.renderPlaylist();
	},
	initEvent: function() {
		$document.on('mousedown.playlist','.js-open-makeModal',e=>{
			this.openMakeModal(e)
		});
		$document.on('mousedown.playlist','.js-makeModal-close',e=>{
			this.closeMakeModal(e);
		})
		$document.on('mousedown.playlist','.js-makeModal-save',e=>{
			this.makePlaylist(e);
		})
		$document.on('mousedown.playlist','.js-add-playlist',e=>{
			this.addToPlaylist(e);
		})
		$document.on('mousedown.playlist','.js-playlist-item',e=>{
			this.renderPlaylistPage(e);
		})
	},
	viewPlaylist: function() {

	},
	openMakeModal: function() {
		this.$makeModal.css('display','block');
	},
	makePlaylist: function() {
		playlist.push(new Playlist(this.$input.val()))
		this.closeMakeModal();
		this.renderPlaylist();
		save('playlist',playlist)
	},
	addToPlaylist: function(e) {
		let idx = e.currentTarget.dataset.playlistIdx;
		let res = this.searchPlaylist(idx);
		playlist[res].list.push(new Music(ContextMenu.music));
		save('playlist',playlist)
	},
	closeMakeModal: function() {
		this.$input.val('');
		this.$makeModal.css('display','none');
	},
	renderPlaylist: function() {
		this.$playlist.html(`<div class="nav-group-title">PLAYLIST</div>`);
		playlist.forEach((item,i)=>{
			this.$playlist.append(`<div class="nav-group-item js-change-page js-playlist-item" data-link="./playlist.html" data-playlist-idx="${item.idx}">${item.name}</div>`)
		})
	},
	renderPlaylistPage: function(e) {
		let idx = e.currentTarget.dataset.playlistIdx;
		let res = this.searchPlaylist(idx);
		playlist[res].list

	},
	searchPlaylist: function(idx) {
		return res = playlist.search((item,i)=>{
			console.log(item,i);
			if (item.idx == idx) {
				return true;
			}
		})[0]
	}
}

class Playlist {
	constructor (name) {
		this.idx = new Date().getTime();
		this.name = name;
		this.list = [];
	}
}

let musicList = [];

$(document).ready(e=>{
	new Promise((res,rej)=>{
		$.getJSON('music_list.json',data=>{
			musicList = data.list;
			res();
		})
	}).then(()=>{
		Loader.init();
		Loader.initEvent();
		Queue.init();
		Queue.initEvent();
		ContextMenu.init();
		ContextMenu.initEvent();
		PlayListController.init();
		PlayListController.initEvent();
	})
})