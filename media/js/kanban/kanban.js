
Kanban = {}

Kanban.Tickets = JAK.ClassMaker.makeClass({
	NAME : 'Kanban.Tickets',
	VERSION : '1.0',
	EXTEND : JAK.ISignals
});
Kanban.Tickets.prototype.$constructor = function(opt){
	this.dom = {};
	this.ec = {};
	this.opt = {
		todoElm : null,
		develElm : null,
		doneElm : null
	}
	for(p in opt){
		this.opt[p] = opt[p];
	}
	this.dom.todo = JAK.gel(this.opt.todoElm);
	this.dom.devel = JAK.gel(this.opt.develElm);
	this.dom.done = JAK.gel(this.opt.doneElm);
	this.dd = new JAK.DragDrop({ revert:true, callbackObject:this, callbackMethod:'_drop' });
	this._link();
};
Kanban.Tickets.prototype._drop = function(drgElm, cloneElm, drops){
	cloneElm.parentNode.removeChild(cloneElm);
	
	var targetElm = drops[0].id;
	var fromElm = drgElm.parentNode.id;
	
	if(targetElm == fromElm){ return; }
	
	if(window.confirm('Opravdu chcete presunout tento tiket ?')){	
		if(targetElm == 'devel' && fromElm == 'todo'){
			var ticketId = drgElm.id.split('-')[1];
			var url = '/kanban/kanban/tododevel/'+ticketId+'/';
			var rq = new JAK.Request(JAK.Request.TEXT/*-, { method : 'post' }-*/);
			rq.setCallback(this, '_move');
			rq.send(url);
		}
		if(targetElm == 'done' && fromElm == 'devel'){
			var ticketId = drgElm.id.split('-')[1];
			var url = '/kanban/kanban/develdone/'+ticketId+'/';
			var rq = new JAK.Request(JAK.Request.TEXT/*-, { method : 'post' }-*/);
			rq.setCallback(this, '_move');
			rq.send(url);
		}
	}
};
Kanban.Tickets.prototype._move = function(txt, status){
	if(status == 200){
		eval('var data = '+txt);
		if(data.status == 'ok' && data.ticketId > 0){
			var ticketElm = JAK.gel('ticket-'+data.ticketId);
			if(ticketElm){
				var table = JAK.gel(data.table);
				table.appendChild(ticketElm);
			}
		} else {
			if(data.status == 'userError'){
				alert('Neoprávněné přesunutí tiketu.');
			} else {
				alert('Chyba!');
			}
		}
	}
};
Kanban.Tickets.prototype._link = function(){
	var todoItems = JAK.DOM.getElementsByClass('ticket', this.dom.todo, 'div');
	var develItems = JAK.DOM.getElementsByClass('ticket', this.dom.devel, 'div');
	var doneItems = JAK.DOM.getElementsByClass('ticket', this.dom.done, 'div');
	for(var i=0;i<todoItems.length;i++){ this.dd.addDraggable(todoItems[i]); }
	for(var i=0;i<develItems.length;i++){ this.dd.addDraggable(develItems[i]); }
	for(var i=0;i<doneItems.length;i++){ this.dd.addDraggable(doneItems[i]); }
	this.dd.addDroppable(this.dom.devel);
	this.dd.addDroppable(this.dom.done);
}

/**
 * Otevirac s efektem pro skryte divy
 **/
Kanban.Opener = JAK.ClassMaker.makeClass({
	NAME : 'Kanban.Opener',
	VERSION : '1.0'
});
Kanban.Opener.prototype.$constructor = function(opt){
	this.opt = {
		opener : null,
		closer : null,
		mainElm : null,
		animation : true,
		hideElm : null,
		isOpen : false
	};
	for(var p in opt){
		this.opt[p] = opt[p];
	}
	this.ec = [];
	this.dom = {};
	this.dom.opener = JAK.gel(this.opt.opener);
	this.dom.closer = this.opt.closer == null ? null : JAK.gel(this.opt.closer);
	this.dom.mainElm = JAK.gel(this.opt.mainElm);
	this.dom.hideElm = this.opt.hideElm == null ? null : JAK.gel(this.opt.hideElm);
	this.isOpen = false;
	/*- jestlize ma byt na zacatku otevreny -*/
	if(this.opt.isOpen){
		this.dom.mainElm.style.display = 'block';
		this.isOpen = this.opt.isOpen;
	}
	this._link();
};
Kanban.Opener.prototype.open = function(e, elm){
	JAK.Events.cancelDef(e);
	if(this.isOpen){ return this.close(); }
	
	/*-this.dom.opener.style.display = 'none';-*/
	if(this.dom.closer){ this.dom.closer.style.display = 'inline'; }
	if(this.dom.hideElm){ this.dom.hideElm.style.display = 'none'; }
	
	if(this.opt.animation){
		this.dom.mainElm.style.visibility = 'hidden';
		this.dom.mainElm.style.position = 'absolute';
		this.dom.mainElm.style.display = 'block';
		this._getBoxHeight();
		this._open();
	} else {
		this.dom.mainElm.style.display = 'block';
	}
	this.isOpen = true;
};
Kanban.Opener.prototype._getBoxHeight = function(){
	this.height = this.dom.mainElm.offsetHeight;
};
Kanban.Opener.prototype._open = function(){
	this.dom.mainElm.style.height = '0px';
	this.dom.mainElm.style.overflow = 'hidden';
	this.dom.mainElm.style.visibility = 'visible';
	this.dom.mainElm.style.position = 'absolute';
	this.dom.mainElm.style.height = this.height+'px';
	var height = this.height;
	var interpolator = new JAK.CSSInterpolator(this.dom.mainElm,360/*,{ endCallback: this._sendNotice.bind(this) }*/);
	/*-interpolator.addProperty('height',0,height,'px');-*/
	interpolator.addProperty('opacity', 0, 1, '');
	interpolator.start();
};
Kanban.Opener.prototype.close = function(e, elm){
	if(e){ JAK.Events.cancelDef(e); }
	if(this.isOpen == true){
		if(this.dom.closer){ this.dom.closer.style.display = 'none'; }
		if(this.opt.animation){
			this._close();
		} else {
			this.dom.mainElm.display = 'none';
		}
	}
	this.isOpen = false;
};
Kanban.Opener.prototype._close = function(){
	var height = this.height;
	var interpolator = new JAK.CSSInterpolator(this.dom.mainElm, 360,{ endCallback: this._setMainBack.bind(this) });
	/*-interpolator.addProperty('height',height,0,'px');-*/
	interpolator.addProperty('opacity', 1, 0, '');
	interpolator.start();
};
Kanban.Opener.prototype._setMainBack = function(){
	this.dom.mainElm.style.height = 'auto';
	this.dom.mainElm.style.display = 'none';
};
Kanban.Opener.prototype._escClose = function(e, elm){
	if(e.keyCode == 27){
		this.close();
	}
};
Kanban.Opener.prototype._link = function(){
	this.ec.push( JAK.Events.addListener(this.dom.opener, 'click', this, 'open') );
	if(this.dom.closer){ this.ec.push( JAK.Events.addListener(this.dom.closer, 'click', this, 'close') ); }
	this.ec.push( JAK.Events.addListener(window, 'keypress', this, '_escClose') );
};

/**
 * Kanban ticket detail
 **/
Kanban.TicketDetail = JAK.ClassMaker.makeClass({
	NAME : 'Kanban.TicketDetail',
	VERSION : '1.0'
});
Kanban.TicketDetail.prototype.$constructor = function(form, logUserId, issuperuser, showLinks){
	this.dom = {};
	this.dom.form = JAK.gel(form);
	this.ec = [];
	this.logUserId = logUserId;
	this.issuperuser = issuperuser == 'True' ? 1 : 0;
	this.isOpen = false;
	this.showLinks = showLinks;
	this.dom.tickets = JAK.DOM.getElementsByClass('avatar');
	this._buildDetail();
	this._link();
};
Kanban.TicketDetail.prototype._buildDetail = function(){
	this.dom.bg = JAK.mel('div', { className : 'detailBg' }, { width : '100%', height : document.body.offsetHeight+'px' } );
	document.body.appendChild(this.dom.bg);
	this.ec.push( JAK.Events.addListener(this.dom.bg, 'click', this, '_hideDetail') );
	this.dom.detailElm = JAK.mel('div', { className : 'ticketDetail' });
	document.body.appendChild(this.dom.detailElm);
	this.dom.detailElm.appendChild(this.dom.form);
};
Kanban.TicketDetail.prototype._showDetail = function(e, elm){
	JAK.Events.cancelDef(e);
	if(!this.isOpen){
		this.isOpen = true;
		this.dom.bg.style.display = 'block';
		this._posBox(elm);
	}
};
Kanban.TicketDetail.prototype._posBox = function(elm){
	var tPos = JAK.DOM.getBoxPosition(elm.parentNode, document.body);
	this.dom.cloneElm = elm.parentNode.cloneNode(true);
	this.dom.cloneElm.style.position = 'absolute';
	this.dom.cloneElm.style.top = tPos.top+'px';
	this.dom.cloneElm.style.left = tPos.left+'px';
	this.dom.cloneElm.style.zIndex = 6;
	document.body.appendChild(this.dom.cloneElm);
	/*- kolik ma detailBox -*/
	this.dom.detailElm.visibility = 'hidden';
	this.dom.detailElm.display = 'block';
	var tboxWidth = document.body.offsetWidth/2;
	var tboxHeight = document.body.offsetHeight/2;
	var tboxLeft = (((tboxWidth-document.body.offsetWidth)/2)*-1);
	var tboxTop = (document.body.offsetHeight/2)+JAK.DOM.getBoxScroll(document.body).top;
	/*- animace -*/
	var inter = new JAK.CSSInterpolator(this.dom.cloneElm, 400, { interpolation: JAK.Interpolator.SIN, endCallback : this._showForm.bind(this) });
	inter.addProperty('width', this.dom.cloneElm.offsetWidth, tboxWidth, 'px');
	inter.addProperty('height', this.dom.cloneElm.offsetHeight, tboxHeight, 'px');
	inter.addProperty('left', tPos.left, tboxLeft, 'px');
	inter.addProperty('top', tPos.top, tboxTop, 'px');
	inter.addProperty('opacity', 0, 1, '');
	inter.start();
};
Kanban.TicketDetail.prototype._showForm = function(){
	this.dom.cloneElm.innerHTML = '';
	var id = this.dom.cloneElm.id.split('ticket-')[1];
	JAK.DOM.addClass(this.dom.cloneElm, 'loading');
	/*- formular -*/
	var formClone = this.dom.form.cloneNode(true);
	this.dom.cloneElm.appendChild(formClone);
	formClone.style.display = 'none';
	/*- request -*/
	var rq = new JAK.Request(JAK.Request.TEXT, { method:'get' });
	rq.setCallback(this, '_getDetail');
	rq.send('/kanban/kanban/ticketdetail/'+id+'/');
};
Kanban.TicketDetail.prototype._removeDetail = function(e, elm){
	if( window.confirm('OPRAVDU ???') ){
		return;
	} else {
		JAK.Events.cancelDef(e);
		return false;
	}
};
Kanban.TicketDetail.prototype._isMyTicket = function(users){
	for(var i=0;i<users.length;i++){
		if(users[i].selected){
			return true;
			break;
		}
	}
	return false;
};
Kanban.TicketDetail.prototype._getDetail = function(JSONData, status){
	eval('var data ='+JSONData);
	var isMyTicket = this._isMyTicket(data.users);
	
	if(JAK.DOM.getElementsByClass('detail-form', this.dom.cloneElm, 'a').length > 0){
		var editForm = JAK.DOM.getElementsByClass('detail-form', this.dom.cloneElm, 'a')[0];
		var infoForm = JAK.DOM.getElementsByClass('detail-info', this.dom.cloneElm, 'a')[0];
		if((isMyTicket == true || this.issuperuser) && this.showLinks ){
			this.ec.push( JAK.Events.addListener( editForm, 'click', this, '_changeDetail' ) );
			this.ec.push( JAK.Events.addListener( infoForm, 'click', this, '_changeDetail' ) );
			var removeElm = JAK.DOM.getElementsByClass('detail-remove', this.dom.cloneElm, 'a')[0];
			if(removeElm){ 
				removeElm.href = '/kanban/kanban/ticketremove/'+data.ticketId+'/';
				this.ec.push( JAK.Events.addListener( JAK.DOM.getElementsByClass('detail-remove', this.dom.cloneElm, 'a')[0], 'click', this, '_removeDetail' ) );
			}
		} else {
			editForm.style.display = 'none';
			infoForm.style.display = 'none';
		}
	}
	if(status == 200){
		var idInput = this.dom.cloneElm.getElementsByTagName('input');
		for(var i=0;i<idInput.length;i++){
			if(idInput[i].type == 'hidden' && idInput[i].className == 'ticketId'){
				idInput[i].value = data.ticketId;
				break;
			}
		}
		var items = JAK.DOM.getElementsByClass('item', this.dom.cloneElm, 'div');
		for(var i=0;i<items.length;i++){
			switch(items[i].id){
				case 'td-service':
					items[i].getElementsByTagName('input')[0].value = data.service;
					items[i].getElementsByTagName('span')[0].innerHTML = data.service;
					break;
				case 'td-desc':
					items[i].getElementsByTagName('textarea')[0].innerHTML = data.description;
					items[i].getElementsByTagName('span')[0].innerHTML = data.description;
					break;
				case 'td-dificulty':
					items[i].getElementsByTagName('input')[0].value = data.difficulty;
					items[i].getElementsByTagName('span')[0].innerHTML = data.difficulty;
					break;
				case 'td-cml':
					items[i].getElementsByTagName('input')[0].value = data.cmlurl;
					items[i].getElementsByTagName('span')[0].innerHTML = '<a href="'+data.cmlurl+'">'+data.cmlurl+'</a>';
					break;
				case 'td-table':
					for(var j=0;j<data.tables.length;j++){
						var opt = JAK.mel('option', { value : data.tables[j].id, innerHTML : data.tables[j].name });
						if(data.tables[j].selected == 1){ opt.selected = true; }
						var sel = items[i].getElementsByTagName('select')[0];
						sel.appendChild(opt);
						if(data.tables[j].selected == 1){
							items[i].getElementsByTagName('span')[0].innerHTML = data.tables[j].name;
						}
					}
					break;
				case 'td-users':
					for(var j=0;j<data.users.length;j++){
						var opt = JAK.mel('option', { value : data.users[j].id, innerHTML : data.users[j].name });
						if(data.users[j].selected == 1){ opt.selected = true; }
						var sel = items[i].getElementsByTagName('select')[0];
						sel.appendChild(opt);
						if(data.users[j].selected == 1){
							items[i].getElementsByTagName('span')[0].innerHTML = data.users[j].name;
						}
					}
					break;
			}
		}
		JAK.DOM.removeClass(this.dom.cloneElm, 'loading');
		this.dom.cloneElm.firstChild.style.display = 'block';
	}
};
Kanban.TicketDetail.prototype._changeDetail = function(e, elm){
	JAK.Events.cancelDef(e);
	this.dom.cloneElm.style.height = 'auto';
	var id = elm.className;
	var infos = this.dom.cloneElm.getElementsByTagName('span');
	var inputs = this.dom.cloneElm.getElementsByTagName('input');
	var selects = this.dom.cloneElm.getElementsByTagName('select');
	var textareas = this.dom.cloneElm.getElementsByTagName('textarea');
	for(var i=0;i<infos.length;i++){
		infos[i].style.display = id == 'detail-form' ? 'none' : 'inline';
	}
	for(var i=0;i<inputs.length;i++){
		inputs[i].style.display = id == 'detail-form' ? 'block' : 'none';
	}
	for(var i=0;i<selects.length;i++){
		selects[i].style.display = id == 'detail-form' ? 'block' : 'none';
	}
	for(var i=0;i<textareas.length;i++){
		textareas[i].style.display = id == 'detail-form' ? 'block' : 'none';
	}
};
Kanban.TicketDetail.prototype._hideDetail = function(e, elm){
	if(this.isOpen){
		this.isOpen = false;
		this.dom.bg.style.display = 'none';
		this.dom.cloneElm.parentNode.removeChild(this.dom.cloneElm);
		this.dom.cloneElm = null;
	}
}
Kanban.TicketDetail.prototype._link = function(){
	for(var i=0;i<this.dom.tickets.length;i++){
		this.ec.push( JAK.Events.addListener(this.dom.tickets[i], 'click', this, '_showDetail') );
	}
};

/*- userTicket -*/
Kanban.UsersTickets = JAK.ClassMaker.makeClass({
	NAME : 'Kanban.UsersTickets',
	VERSION : '1.0'
});
Kanban.UsersTickets.prototype.$constructor = function(select){
	this.select = JAK.gel(select);
	this.ec = [];
	this._link();
};
Kanban.UsersTickets.prototype._changeTickets = function(e, elm){
	var user = elm.value;
	var imgs = JAK.gel('tablesTickets').getElementsByTagName('img');
	for(var i=0;i<imgs.length;i++){
		if(user == '0'){
			var nodeElm = imgs[i].parentNode.parentNode.parentNode;
			nodeElm.style.display = 'block';
		} else {
			if(imgs[i].alt != user){
				var nodeElm = imgs[i].parentNode.parentNode.parentNode;
				nodeElm.style.display = 'none';
			} else {
				var nodeElm = imgs[i].parentNode.parentNode.parentNode;
				nodeElm.style.display = 'block';
			}
		}
	}
};
Kanban.UsersTickets.prototype._link = function(){
	this.ec.push( JAK.Events.addListener(this.select, 'change', this, '_changeTickets') );
};
