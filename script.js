canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

function defineCanvas(){
	canvas.height = window.innerHeight
	canvas.width = window.innerWidth
}

defineCanvas()

function game_update(){
	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0,0,canvas.width, canvas.height)
}

class Panel{
	constructor(area){
		this.gameArea = area

		this.size = {w:canvas.width,h:canvas.height/8}

		this.cells = []

		this.cells = {distance: canvas.height/7,
					  colors: ['#e34444', '#4d9edb', '#962c2c','#346991'],
					  content: [],
					  index: 0,
					  type: {color: 0, level: 0},
					  size: canvas.height/14}

		this.money = 0
		this.isGotCoin = false
		this.isPaid = false

		this.appendContent(0,1)
		this.appendContent(0,2)
		this.appendContent(0,3)

		this.appendContent(1,1)
		this.appendContent(1,2)
		this.appendContent(1,3)

		this.isChosen = false

		this.checkMouseUp()
		this.getMousePos(0,0)
	}
	appendContent(color, level){
		this.cells.content.push({color:color, level:level})
	}
	getMousePos(x,y){
		this.mousePos = {x: x, y: y}
	}

	checkMouseDown(){
		this.mouse = true
	}
	checkMouseUp(){
		this.mouse = false
	}

	drawBG(){
		ctx.fillStyle = '#235745'
		ctx.fillRect(0,0,this.size.w, this.size.h)
	}
	drawOneCell(x,y,color,level){
		ctx.fillStyle = this.cells.colors[color]
		ctx.fillRect(x, y, this.cells.size, this.cells.size)
		ctx.fillStyle = '#000000'


		ctx.font = '500 '+ (this.cells.size*0.75).toString()+'px Roboto'
		let bl_size = this.cells.size
		ctx.globalAlpha = 0.7
		ctx.fillText(level.toString(),x+bl_size/2-bl_size*0.21,y+bl_size*0.75)
		ctx.globalAlpha = 1
	}
	drawCells(){
		for (let i in this.cells.content){
			this.drawOneCell(i*this.cells.distance+this.cells.size/2, 
					 		 this.size.h/2-this.cells.size/2, this.cells.content[i].color, this.cells.content[i].level)
		}
	}
	drawMoney(){
		ctx.font = '500 '+ (this.cells.size*0.75).toString()+'px Roboto'
		ctx.fillStyle = '#FFFFFF'
		ctx.fillText(this.money.toString(), this.size.w-this.cells.size*0.75 - this.money.toString().length*this.cells.size*0.25, 
																						   this.size.h/2+this.cells.size*0.25)
	}
	distfunc(x1,y1,x2,y2){
		let vector = {x: x2-x1, y: y2-y1}
		return Math.sqrt(vector.x**2 + vector.y**2)
	}
	moveCells(){
		if(this.mouse && !this.isChosen){
		for (let i in this.cells.content){
			let pos = {x: i*this.cells.distance+this.cells.size/2,
					   y: this.size.h/2-this.cells.size/2}
			if(this.distfunc(this.mousePos.x, this.mousePos.y, pos.x+this.cells.size/2, pos.y+this.cells.size/2) < this.cells.size/2){
				this.cells.index = i
				this.cells.type.color = this.cells.content[i].color
				this.cells.type.level = this.cells.content[i].level
				this.isChosen = true
				break
			}
		}
	  }
	  	if(this.mouse && this.isChosen){
	  		if(this.money < this.cells.type.level && this.cells.type.color==1){ 
	  			return null
	  		}

	  		this.cells.content[this.cells.index].color = this.cells.type.color + 2

	  		this.drawOneCell(this.mousePos.x-this.cells.size/2, this.mousePos.y-this.cells.size/2, this.cells.type.color, this.cells.type.level)
	  		let gameArea = this.gameArea.pre.block
	  		gameArea.x = this.mousePos.x
	  		gameArea.y = this.mousePos.y
	  		gameArea.show = true

	  		this.isGotCoin = true
	  		this.isPaid = true
	  	}
	  	if(!this.mouse){
	  		if(this.cells.type.color != null && this.cells.content[this.cells.index] != null){
	  		this.cells.content[this.cells.index].color = this.cells.type.color
	  		}

	  		if(this.cells.type.color==0 && this.isGotCoin && this.gameArea.pre.block.apply){
	  			this.money += this.cells.type.level
	  			console.log(this.money)
	  		}
	  		if(this.cells.type.color==1 && this.money >= this.cells.type.level && this.isPaid && this.gameArea.pre.block.apply){
	  			this.money -= this.cells.type.level
	  		}

	  		this.gameArea.pre.block.color = this.cells.type.color
	  		this.gameArea.pre.block.level = this.cells.type.level
	  		this.gameArea.pre.block.show = false
	  		this.isChosen = false
	  		this.isGotCoin = false
	  		this.isPaid = false
	  	}
	}
	clearUndefined(list){
		let clearedList = []
		for(let i in list){
			if(list[i] != null){
				clearedList.push(list[i])
			}
		}
		return clearedList
	}
	draw(){
		this.drawBG()
		this.drawCells()
		this.drawMoney()
	}
	update(){
		this.draw()
		this.moveCells()
	}
}

class Area{
	constructor(){
		this.panel = {h: canvas.height/7.92}
		this.blocks = {size: canvas.height/15,
					   list: []}
		this.pre = {block: {x: 0, y: 0, show:false, apply:false, color: 0, level: 0}}

		this.grid = {size: {w:Math.floor(canvas.width/this.blocks.size-2), h:Math.floor(canvas.height/this.blocks.size-3)},
					 distance: 1.1,
					 list: []}
		this.margin = {x: (canvas.width-this.blocks.size*this.grid.size.w*this.grid.distance*0.995)/2, y: 0}
		this.colors = ['#e34444', '#4d9edb', '#962c2c']
	}

	gridIter(func){
		for(let i=0; i<this.grid.size.w; i++){
			for(let j=0; j<this.grid.size.h; j++){
				func(i,j)
			}
		}
	}

	genGrid(){
		ctx.fillStyle = '#8fd99e'
		let bl_size = this.blocks.size
		let diff = this.grid.distance
		let panel_h = this.panel.h
		let margin = this.margin

		this.gridIter(function(i,j){
			let pos = {x: i*bl_size*diff+margin.x, y: j*bl_size*diff+margin.y+panel_h}
			ctx.fillRect(pos.x, pos.y,
						 bl_size, bl_size)
		})
	}

	distfunc(x1,y1,x2,y2){
		let vector = {x: x2-x1, y: y2-y1}
		return Math.sqrt(vector.x**2 + vector.y**2)
	}

	cancelBlock(x,y){
		for(let index in this.blocks.list){
			let block = this.blocks.list[index]
			if(block.x == x && block.y == y){
				return true
			}
		} 
		return false
	}

	drawPreBlock(){
		var apply = {pos: {x: -1, y: -1}}
		if(this.pre.block.show){
				let bl_size = this.blocks.size
				let bl_pos = this.pre.block
				let diff = this.grid.distance
				let panel_h = this.panel.h
				let distfunc = this.distfunc
				let margin = this.margin

				this.gridIter(function(i,j){
					let pos = {x: i*bl_size*diff+margin.x, y: j*bl_size*diff+margin.y+panel_h}
					if(distfunc(pos.x+bl_size/2,pos.y+bl_size/2,bl_pos.x,bl_pos.y) < bl_size/2){
						ctx.fillStyle = '#2a9c41'
						ctx.fillRect(pos.x, pos.y, bl_size, bl_size)
						apply.pos = {x: pos.x, y: pos.y}
						return null
				}
			})
			if(apply.pos.x >= 0 && apply.pos.y >= 0){
				this.pre.block.x = apply.pos.x + bl_size/2
				this.pre.block.y = apply.pos.y + bl_size/2
				this.pre.block.apply = true
			}else{
				this.pre.block.apply = false
			}
			if(this.cancelBlock(this.pre.block.x, this.pre.block.y)){
				this.pre.block.apply = false
			}
		}else if(this.pre.block.apply){
			let bl_size = this.blocks.size
			this.addBlock(this.pre.block.x ,this.pre.block.y, this.pre.block.color, this.pre.block.level)
			this.blockEffect(this.blocks.list[this.blocks.list.length-1])
			this.clearEffect()
			this.pre.block.apply = false
		}
	}

	addBlock(x,y,color,level){
		this.blocks.list.push({x:x,y:y,color:color,level:level})
	}

	blockEffect(block){
		let bl_size = this.blocks.size
		let diff = this.grid.distance
		let margin = this.margin
		let panel_h = this.panel.h

		let x = block.x
		let y = block.y
		let color = block.color
		let level = block.level


		let basis = this.grid.distance * bl_size
		let dirs = function(x,y){return [{x: x - basis, y: y},
							 			 {x: x + basis, y: y},
							 			 {x: x, y: y - basis},
							 			 {x: x, y: y + basis}]}

		let layers = [[{x:x, y:y, color:color, level:level}]]

		for(let l=0; l<level; l++){
			let layer = []
			for(let lo in layers[l]){
				lo = layers[l][lo]
				let dirs_ = dirs(lo.x, lo.y)
				for(let d in dirs_){
				d = dirs_[d]
				layer.push({x:d.x, y:d.y, color:color, level:level})
				}
			}
			layers.push(layer)
		}


		// Clear into one layer
		for(let l=0; l<layers.length; l++){
			for(let lo=0; lo<layers[l].length; lo++){
			for(let ll=lo+1; ll<layers[l].length; ll++){
				let lo_ = layers[l][lo]
				let ll_ = layers[l][ll]

				if(lo_ == null || ll_ == null){continue}

				if(lo_.x == ll_.x && lo_.y == ll_.y){
					delete layers[l][ll]
				}
			}
			}
		}

		// Clear among all layers
		for(let lo=0; lo<layers.length; lo++){
		for(let ll=lo+1; ll<layers.length; ll++){


				for(let llo in layers[lo]){
				for(let lll in layers[ll]){
					let llo_ = layers[lo][llo]
					let lll_ = layers[ll][lll]

					if(llo_.x == lll_.x && llo_.y == lll_.y){
						delete layers[ll][lll]
					} 
				}
				}
			}
		}


		// Grid size
		let width = this.grid.size.w*this.blocks.size*this.grid.distance + this.margin.x
		let height = this.grid.size.h*this.blocks.size*this.grid.distance + this.margin.y + this.panel.h

		// Fill block list
		for(let l in layers){
			if(l==0){continue}
			l = layers[l]

			for(let lo in l){
				lo = l[lo]
				if(lo!=null){
					if(lo.x > this.margin.x && lo.x < width &&
					   lo.y > this.margin.y + this.panel.h && lo.y < height){
						this.addBlock(lo.x,lo.y,color,level)
					}
				}
			}
		}
	}

	distfunc(x1,y1,x2,y2){
		let vector = {x: x2-x1, y: y2-y1}
		return Math.sqrt(vector.x**2 + vector.y**2)
	}

	clearEffect(){
		let red = []
		let blue = []

		for(let i in this.blocks.list){
			let block = this.blocks.list[i]
			if(block.color == 0){
				red.push(block)
			}
			if(block.color == 1){
				blue.push(block)
			}
		}

		for(let r in red){
			let r_ = red[r]
			for(let b in blue){
				let b_ = blue[b]
				if(this.distfunc(b_.x, b_.y, r_.x, r_.y) < this.blocks.size/2){
					delete red[r]
				}
			}
		}
	
		this.blocks.list = []
		for(let r in red){
			r = red[r]
			if(r != null){
				this.blocks.list.push(r)
			}
		}
	}

	drawBlock(){
		for(let index in this.blocks.list){
			let block = this.blocks.list[index]
			let size = this.blocks.size
			ctx.fillStyle = this.colors[block.color]
			ctx.fillRect(block.x-size/2, block.y-size/2, size, size)
		}
	}

	update(){
		this.genGrid()
		this.drawPreBlock()
		this.drawBlock()
	}
}


const fps = 60
const gameArea = new Area()

const panel = new Panel(gameArea)

function animate(){
	setTimeout(()=>{
	window.requestAnimationFrame(animate)
	}, 1000/fps)

	defineCanvas()

	game_update()

	gameArea.update()
	panel.update()
}

addEventListener('mousemove', function(event){
	panel.getMousePos(event.clientX, event.clientY)
})

onmousedown = function(){
	panel.checkMouseDown()
}

onmouseup = function(){
	panel.checkMouseUp()
}

animate()