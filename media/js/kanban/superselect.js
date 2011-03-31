/**
 * @CLASS
 * Super Select
 * Javascriptove nahrazeni systemoveho selectu pro rozsirene moznosti vkladani elementu do jednotlivuch optionu apod.
 * Ma vsechny vlastnosti jako systemovy select.
 **/
JAK.SuperSelect = JAK.ClassMaker.makeClass({
	NAME : 'JAK.SuperSelect',
	VERSION : '1.0',
	IMPLEMENT : JAK.ISignals
});

/**
 * @constructor
 * @param {object} opt konfiguracni objekt
 * @param {HTMLElement} opt.select element selectu ktery se ma nahradit
 * @param {string} opt.name nazev selectu pro odesilani spravneho nazvu promenne do formulare
 * @param {array} opt.data pole objektu optionu. Vklada se pole [ { elm : '', value : ''}, index{int} ]
 * @param {HTMLElement} opt.place element do ktereho se vybuildi select
 * @param {boolean} opt.onlyTextSelected prepinac zobrazovani jen textu ve vybranem selectu
 * @param {string} opt.optionsRootWidth velikost kontejneru optionu
 * @param {object} opt.classNames objekt css trid pro jednotlive elementy superSelectu
 **/
JAK.SuperSelect.prototype.$constructor = function(opt){
	this.opt = {
		select : null,
		name : null,
		data : [],
		place : null,
		onlyTextSelected : false,
		classNames : {
			select : 'superSelect',
			focus  : 'superSelFocus',
			options: 'superSelOptions',
			option : 'superSelOption',
			active : 'optActive'
		}
	}
	for(var p in opt){
		this.opt[p] = opt[p];
	}
	
	/*- promena udalosti pro zavirani selectu pro kliknuti mimo -*/
	this.wc = false;
	/*- je-li otevreny ci zavreny select -*/
	this.optionsOpen = false;
	/*- aktivni option {index} -*/
	this.selectedOption = 0;
	/*- texty v optionech -*/
	this.selectTexts = [];
	/*- dynamicke pole hledaneho textu -*/
	this.searchWords = [];
	/*- hledane slovo -*/
	this.searchWord = '';
	/*- pocet zmacknuti hledani slova -*/
	this.countSearching = 0;
	this.ec = [];
	this.ecOpt = [];
	this.dom = {};
	this.dom.place = this.opt.place ? JAK.gel(this.opt.place) : false;
	this.dom.select = this.opt.select ? JAK.gel(this.opt.select) : false;
	this._build();
	this._getContent();
	this._getSameWords();
	this._link();
}

/**
 * Metoda pro naveseni udalosti
 **/
JAK.SuperSelect.prototype._link = function(){
	this.ec.push( JAK.Events.addListener( this.dom.focusElm, 'click', this, '_open' ) );
	this.ec.push( JAK.Events.addListener( this.dom.focusElm, 'keypress', this, '_keyAction') );
	this.ec.push( JAK.Events.addListener( window, 'keydown', this, '_keyEsc') );
}

/**
 * Metoda vracejici aktualni hodnotu
 **/
JAK.SuperSelect.prototype.getValue = function(){
	return this.dom.input.value;
}

/**
 * Metoda vracejici hidden input superSelectu
 **/
JAK.SuperSelect.prototype.getInput = function(){
	return this.dom.input;
}

JAK.SuperSelect.replaceAllSelects = function(){
	var selects = JAK.DOM.arrayFromCollection(document.body.getElementsByTagName('select'));
	for(var i=0;i<selects.length;i++){
		if(selects[i].className != 'superSelect'){
			var sc = selects[i].className != '' ? 'superSelect'+'_'+selects[i].className : 'superSelect';
		} else {
			var sc = 'superSelect';
		}
		var opt = {
			select : selects[i],
			name : selects[i].name,
			classNames : {
				select : sc,
				focus  : 'superSelFocus',
				options: 'superSelOptions',
				option : 'superSelOption',
				active : 'optActive'
			}
		};
		new JAK.SuperSelect(opt);
	}
}

/**
 * destructor
 **/
JAK.SuperSelect.prototype.$destructor = function(){
	/*- odveseni kliknuti mimo -*/
	if(this.wc){ JAK.Events.removeListener(this.wc); }
	this.ec.forEach(JAK.Events.removeListener, JAK.Events);
	this.ecOpt.forEach(JAK.Events.removeListener, JAK.Events);
	for(var p in this.dom){
		this.dom[p] = null;
	}
}

/**
 * Metoda ktera vycisti select od vsech optionu
 **/
JAK.SuperSelect.prototype.clear = function(){
	for(var i=0;i<this.dom.options.length;i++){
		this.dom.optionsRoot.removeChild(this.dom.options[i].elm);
	}
	this.ecOpt.forEach(JAK.Events.removeListener, JAK.Events);
	this.ecOpt = [];
	this.dom.options = [];
	/*- vycisteni inputu aby pri zandym optionu nemel zadnou hodnotu -*/
	this.dom.input.value = '';
}

/**
 * addOptions metoda pro hromadne pridavani optionu do selectu
 * @param {array} data pole objektu optionu
 * @param {object} data[0] object elm,value optionu
 * @param {int} data[1] index optionu v selectu
 **/
JAK.SuperSelect.prototype.addOptions = function(data){
	for(var i=0;i<data.length;i++){
		this.addOption(data[i][0], data[i][1]);
	}
}

/**
 * addOption metoda pro pridani optionu do selectu
 * @param {object} optObj elm,value
 * @param {HTMLElement} optObj.elm elementy vlozene do optionu, muze byt i innerHTML
 * @param {string} optObj.value hodnota optionu
 * @param {int} index index pole optionu kam se ma vlozit, pokud zadny neni vlozi se nakonec
 **/
JAK.SuperSelect.prototype.addOption = function(optObj, index){
	var option = JAK.cel('div', this.opt.classNames.option);
	var obj = {};
	if(typeof(optObj.elm) == 'string'){
		option.innerHTML = optObj.elm;
		obj = { elm : option, value : optObj.value, selected : optObj.selected };
	} else if(typeof(optObj.elm) == 'object'){
		option.appendChild(optObj.elm);
		obj = { elm : option, value : optObj.value, selected : optObj.selected };
	}
	if(index){
		this.dom.optionsRoot.insertBefore(obj.elm, this.dom.options[index].elm);
		this.dom.options.splice(index,0, obj);
		this.ecOpt.push( JAK.Events.addListener( obj.elm, 'mouseover', this, '_optionOver' ) );
		this.ecOpt.push( JAK.Events.addListener( obj.elm, 'mouseout', this, '_optionOut' ) );
		this.ecOpt.push( JAK.Events.addListener( obj.elm, 'click', this, '_getIndex' ) );
	} else {
		this.dom.options.push(obj);
		this.dom.optionsRoot.appendChild(obj.elm);
		this.ecOpt.push( JAK.Events.addListener( this.dom.options[this.dom.options.length-1].elm, 'mouseover', this, '_optionOver' ) );
		this.ecOpt.push( JAK.Events.addListener( this.dom.options[this.dom.options.length-1].elm, 'mouseout', this, '_optionOut' ) );
		this.ecOpt.push( JAK.Events.addListener( this.dom.options[this.dom.options.length-1].elm, 'click', this, '_getIndex' ) );
	}
	this._getContent();
	this._getSameWords();
}

/**
 * _getContent metoda pro ziskani textoveho kontentu vsech optionu pro vyhledavani a umisteni do pole
 **/
JAK.SuperSelect.prototype._getContent = function(){
	this.searchWords = [];
	for(var i=0;i<this.dom.options.length;i++){
		var childs = this.dom.options[i].elm.childNodes;

		for(var j=0;j<childs.length;j++){
			if(childs[j].nodeType == 3){
				this.searchWords.push(childs[j].data);
				break;
			} else {
				if(childs[j].innerText){
					this.searchWords.push(childs[j].innerText.trim());
				} else {
					this.searchWords.push(childs[j].textContent.trim());
				}
			}
		}
	}
}

/**
 * metoda, prochazi vsechny slova a tridi je do stejnych zacatecnich pismen
 **/
JAK.SuperSelect.prototype._getSameWords = function(){
	this.sameWordsArray = [];
	var letters = [];
	if(this.searchWords.length > 0){
	    /*- vybrani pismen -*/
		for(var i=0;i<this.searchWords.length;i++){
			var letter = this.searchWords[i].charAt(0).toLowerCase();
			var isOn = true;
			for(var j=0;j<letters.length;j++){
				if(letter == letters[j]){
				    isOn = false;
					break;
				} else {
				    isOn = true;
				}
			}
			if(isOn){
				letters.push(letter);
			}
		}
		/*- roztrideni slov -*/
		for(var i=0;i<letters.length;i++){
			sortWords = [];
			for(var j=0;j<this.searchWords.length;j++){
				if(this.searchWords[j].toLowerCase().indexOf(letters[i]) == 0){
					sortWords.push({ index : j,  word : this.searchWords[j] });
				}
			}
			var obj = {
			    letter : letters[i],
			    words : sortWords
			};
			this.sameWordsArray.push(obj);
		}
	}
}

/**
 * Metoda pro vybuildeni selectu
 **/
JAK.SuperSelect.prototype._build = function(){
	this.dom.root = JAK.mel('div', { className : this.opt.classNames.select });
	this.dom.focusElm = JAK.mel('a', { href : '#', className : 'superSelfocus' }, { display : 'block', width:'100%', height:'100%' } );
	this.dom.focusFillElm = JAK.mel('span', { className : 'superSelFill' });
	this.dom.optionsRoot = JAK.mel('div', { className : this.opt.classNames.options }, { display : 'none', visibility : 'hidden' });
	this.dom.options = [];
	
	this.ec.push( JAK.Events.addListener(this.dom.focusElm, 'blur', this, '_resetSearch') );
	this.dom.focusElm.appendChild(this.dom.focusFillElm);
	this.dom.root.appendChild(this.dom.focusElm);
	this.dom.root.appendChild(this.dom.optionsRoot);
	
	if(this.dom.select){
		var options = this.dom.select.getElementsByTagName('option');
		for(var i=0;i<options.length;i++){
			var option = JAK.mel('div', { className : this.opt.classNames.option }, { cursor : 'pointer' });
			option.innerHTML = options[i].innerHTML;
			if(options[i].className != ''){
				JAK.DOM.addClass(option, options[i].className);
			}
			if(options[i].selected){
				/*- nastaveni aktivni opsny -*/
				this.selectedOption = i;
				var selectedOpt = options[i];
				JAK.DOM.addClass(option, this.opt.classNames.active);	
			}
			this.ecOpt.push( JAK.Events.addListener( option, 'mouseover', this, '_optionOver' ) );
			this.ecOpt.push( JAK.Events.addListener( option, 'mouseout', this, '_optionOut' ) );
			this.ecOpt.push( JAK.Events.addListener( option, 'click', this, '_getIndex' ) );
			var pushOption = { elm : option, value : options[i].value };
			this.dom.options.push(pushOption);
			this.dom.optionsRoot.appendChild(option);
			this.dom.root.appendChild(this.dom.optionsRoot);
		}
		this.dom.focusFillElm.innerHTML = selectedOpt ? selectedOpt.innerHTML : options[0].innerHTML;
		this.dom.select.parentNode.insertBefore(this.dom.root, this.dom.select);
		
		/*- zahozeni stareho selectu a vytvoreni hidden inputu -*/
		this.dom.select.parentNode.removeChild(this.dom.select);
	} else {
		this.addOptions(this.opt.data);
		this._selectSelectedOption();
		this.dom.place.appendChild(this.dom.root);
	}
	this.dom.input = JAK.mel('input', { type : 'hidden', name : this.opt.name, value : '' });
	this.dom.root.appendChild(this.dom.input);
	this.selectOption(this.selectedOption);
}

/**
 * Metoda pro nastaveni vybraneho optionu pri vytvareni superselectu a nastavovani jeho dat
 **/
JAK.SuperSelect.prototype._selectSelectedOption = function(){
	for(var i=0;i<this.dom.options.length;i++){
		if(this.dom.options[i].selected == true){
			this.selectedOption = i;
		}
	}
}

/**
 * Nuluje vsechna predchozi hledani v zasobnich
 **/
JAK.SuperSelect.prototype._resetSearch = function(e,elm){
	this.searchWord = '';
	this.countSearching = 0;
	this.sameWords = [];
	if(this.resetTimer){ this.resetTimer = false; }
}

/**
 * Nastavuje aktivni option
 **/
JAK.SuperSelect.prototype._setActiveOption = function(){
	for(var i=0;i<this.dom.options.length;i++){
		if(i == this.selectedOption){
			JAK.DOM.addClass(this.dom.options[i].elm, 'optActive');
		} else {
			JAK.DOM.removeClass(this.dom.options[i].elm, 'optActive');
		}
	}
}

/**
 * Metoda pro vyber optionu a ziskani jeho indexu
 * @param {event} e udalost
 * @param {HTMLElement} elm element na kterej je navesena udalost 
 **/
JAK.SuperSelect.prototype._getIndex = function(e,elm){
	JAK.Events.cancelDef(e);
	for(var i=0;i<this.dom.options.length;i++){
		if(this.dom.options[i].elm == elm){
			this.selectOption(i);
			this._close();
			this.dom.focusElm.focus();
			break;
		}
	}
}

/**
 * Memtoda pro kliknuti mimo a zavreni rozbaleneho selectu
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._windowClick = function(e, elm) {
	var cElm = JAK.Events.getTarget(e);
	while (cElm) {
		if (cElm == this.dom.root) {
			return;
		}
		cElm = cElm.parentNode;
	}
	if(this.optionsOpen){
		this._close();
	}
}

/**
 * Obarvuje option pri najeti mysi
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._optionOver = function(e,elm){
	JAK.DOM.addClass(elm, 'optOver');
}

/**
 * Obarvuje zpet option pri odjeti mysi
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._optionOut = function(e,elm){
	JAK.DOM.removeClass(elm, 'optOver');
}

/**
 * Metoda pro akci pri najeti mysi na select
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._hover = function(e,elm){
	return;
}

/**
 * Otevirani selectu + naveseni udalosti na kliknuti mimo select a jeho zavreni
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._open = function(e,elm){
	JAK.Events.cancelDef(e);
	if(this.optionsOpen){
		this._close();
	} else {
		this.dom.optionsRoot.style.display = 'block';
		this.dom.optionsRoot.style.visibility = 'visible';
		this.optionsOpen = true;
		this._selectScroll();
	}
	if(!this.wc){ this.wc = JAK.Events.addListener(window, 'click', this, '_windowClick'); }
}

/**
 * Metoda pro zavreni selectu
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._close = function(e,elm){
	this.dom.optionsRoot.style.display = 'none';
	this.dom.optionsRoot.style.visibility = 'hidden';
	this.optionsOpen = false;
	if(this.wc){ JAK.Events.removeListener(this.wc); }
	this.wc = false;
}

/**
 * Metoda pro zpracovavani udalosti pri zmacknuti klavesy
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._keyAction = function(e,elm){
	var code = e.keyCode;
	if(code == 9){
		return;
	} else {
		JAK.Events.cancelDef(e);
		switch(code){
			case 37 :
				this._previousOption();
				this._resetSearch();
				break;
			case 39 :
				this._nextOption();
				this._resetSearch();
				break;
			case 38 :
				this._previousOption();
				this._resetSearch();
				break;
			case 40 :
				this._nextOption();
				this._resetSearch();
				break;
			case 33 :
				this._startOption();
				this._resetSearch();
				break;
			case 34 :
				this._endOption();
				this._resetSearch();
				break;
			case 36 :
				this._startOption();
				this._resetSearch();
				break;
			case 35 :
				this._endOption();
				this._resetSearch();
				break;
			case 27 :
				this._close();
				this._resetSearch();
				break;
			default :
				this._searchWord(e);
				break;
		}
	}
}

/**
 * Metoda pro hledani stejnych slov a jejich oznacovani
 **/
JAK.SuperSelect.prototype._searchSameWords = function(sameLetter){
	if(this.countSearching == 0){
	    this.searchWord = sameLetter[0].letter;
	    this.countSearching = (sameLetter[1]+1);
	}
	var numOfSameWords = sameLetter[0].words.length;
	var num = this.countSearching > (numOfSameWords-1) ? this.countSearching-(numOfSameWords*(Math.floor(this.countSearching/numOfSameWords))) : this.countSearching;
	this.selectOption(sameLetter[0].words[num].index);
	this.countSearching++;
}

/**
 * Metoda pro zjistovani zda je vybrany option stejneho zacatecniho pismena jako hledane pismeno
 * @return false | {array}
 **/
JAK.SuperSelect.prototype._isSelectedLetter = function(sChar){
	for(var i=0;i<this.sameWordsArray.length;i++){
		if(this.sameWordsArray[i].letter == sChar){
		    for(var j=0;j<this.sameWordsArray[i].words.length;j++){
				if(this.sameWordsArray[i].words[j].index == this.selectedOption){
					return [this.sameWordsArray[i], j];
				}
			}
			break;
		}
	}
	return false;
}

/**
 * Metoda pro hledani slov
 * @param {event} e udalost pro ziskani keyCharCode
 **/
JAK.SuperSelect.prototype._searchWord = function(e){
	if(this.resetTimer){ clearTimeout(this.resetTimer); }
	var sChar = String.fromCharCode(e.charCode).toLowerCase();
	var sameLetter = this._isSelectedLetter(sChar);
	/*- hledani slov se stejnym zacatecnim pismenem -*/
	if((this.searchWord.length == 1 && this.searchWord == sChar) || sameLetter){
		this._searchSameWords(sameLetter);
	} else {
		this.searchWord += sChar;
		var cropedWords = this._cropSelectTexts(this.searchWord.length);
		for(var i=0;i<cropedWords.length;i++){
			if(this.searchWord.toLowerCase() == cropedWords[i].toLowerCase()){
				this.selectOption(i);
				break;
			}
		}
	}
	this.resetTimer = setTimeout(this._resetSearch.bind(this), 1000);
}

/**
 * Metoda pro orezavani slov
 * @param {int} num pocet kolik ma orezat od zacatku
 **/
JAK.SuperSelect.prototype._cropSelectTexts = function(num){
	var cropedSel = [];
	for(var i=0;i<this.searchWords.length;i++){
		var crop = this.searchWords[i].substring(0,num);
		cropedSel.push(crop);
	}
	return cropedSel;
}

/**
 * MEtoda pro zavreni selectu po zmacknuti Esc
 * @param {event} e udalost
 * @param {HTMLElement} elm na kterem je udalost navesena
 **/
JAK.SuperSelect.prototype._keyEsc = function(e,elm){
	if(e.keyCode == 27){
		this._close();
	}
}

/**
 * Metoda pro spravne odscrolovani zobrazeneho selectu
 **/
JAK.SuperSelect.prototype._selectScroll = function(){
	if(this.optionsOpen && this.dom.options.length > 0){
		var scrollTop = this.dom.optionsRoot.scrollTop;
		var scrollHeight = this.dom.optionsRoot.scrollHeight;
		var optionsHeight = this.dom.optionsRoot.offsetHeight;
		var optionPos = this.dom.options[this.selectedOption].elm.offsetTop;
		var optionHeight = this.dom.options[this.selectedOption].elm.offsetHeight;
		if(optionPos < scrollTop){
			this.dom.optionsRoot.scrollTop = optionPos;
		} else if (optionPos >= (optionsHeight+scrollTop)) {
			this.dom.optionsRoot.scrollTop = (((optionPos+optionHeight)-optionsHeight));
		}
	}
}

/**
 * Metoda pro vybrani optionu
 * @param {int} index index vybraneho optionu
 **/
JAK.SuperSelect.prototype.selectOption = function(index){
	this.selectedOption = index;
	this._selectOption();
}

/**
 * Metoda pro vybrani selectu
 **/
JAK.SuperSelect.prototype._selectOption = function(){
	if(this.dom.options.length > 0){
		this.dom.input.value = this.dom.options[this.selectedOption].value;
		var txtCont = this.dom.options[this.selectedOption].elm.innerText ? this.dom.options[this.selectedOption].elm.innerText.trim() : this.dom.options[this.selectedOption].elm.textContent.trim();
		this.dom.focusFillElm.innerHTML = this.opt.onlyTextSelected ? txtCont : this.dom.options[this.selectedOption].elm.innerHTML;
		this.makeEvent('selected');
		this._setActiveOption();
		this._selectScroll();
	}
}

/**
 * Metoda pro vybrani select podle jeho hodnoty 
 **/
JAK.SuperSelect.prototype.selectOptionByValue = function(value){
	for(var i=0;i<this.dom.options.length;i++){
		if(this.dom.options[i].value == value){
			this.selectOption(i);
			break;
		}
	}
}

/**
 * MEtoda pro vybrani predchozi optionu
 **/
JAK.SuperSelect.prototype._previousOption = function(){
	var index = this.selectedOption-1;
	this.selectedOption = index < 0 ? 0 : this.selectedOption-1;
	this._selectOption();
}

/**
 * Metoda pro vybrani dalsiho optionu
 **/
JAK.SuperSelect.prototype._nextOption = function(){
	var index = this.selectedOption+1;
	this.selectedOption = index > (this.dom.options.length-1) ? (this.dom.options.length-1) : this.selectedOption+1;
	this._selectOption();
}

/**
 * Metoda pro vybrani prvniho optionu
 **/
JAK.SuperSelect.prototype._startOption = function(){
	this.selectedOption = 0;
	this._selectOption();
}

/**
 * Metoda pro vybrani posledniho optionu
 **/
JAK.SuperSelect.prototype._endOption = function(){
	this.selectedOption = (this.dom.options.length-1);
	this._selectOption();
}



