class App {
    constructor() {
        this.init();
    }

    init() {
        let path= location.pathname=="/"? "/index.html": location.pathname;
		history.replaceState({ path }, null, path);
		musicList= JSON.parse(localStorage.getItem("data"));
		if(!musicList){
			$.getJSON('/public/json/music_list.json', async data =>{
				musicList= await Promise.all(data.map(async v =>{
					v.duration= await this.getDuration(v.url);
					return v;
				}));
				localStorage.setItem("data", JSON.stringify(musicList));
				player= new Player();
				action[/\/(.*).html/.exec(path)[1]]();
				this.eve();
				this.onLoad();
			});
		}else{
			player= new Player();
			action[/\/(.*).html/.exec(path)[1]]();
			this.eve();
			this.onLoad();
		}
    }
}

window.addEventListener("load", e =>{
	let app = new App();
});