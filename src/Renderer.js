import marked from 'marked'

class Renderer {
  
  constructor( ast ) {
    this.markup = this.build( ast )
  }

  build( tree ) {
    let rendered = ""

    tree.forEach( node => {
      if ( node ) {

        if ( node.type === "command" ) {
          rendered += `<div class="${node.value} ${node.args?.join(' ')}">`

          if (node.children?.length) {
            rendered += this.build( node.children ) 
          }

          rendered += `</div>`
          
        } else if (node.type === "content") {
          rendered += marked(node.value)
        }

      }
    })


      

    // console.log( rendered )

    return rendered;
  }
}

export default Renderer;