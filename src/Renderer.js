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
          const classes = node.args?.join(' ') ?? "";
          console.log( classes )
          rendered += `<div class="${node.value}${ classes ? " " + classes : "" }">`

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