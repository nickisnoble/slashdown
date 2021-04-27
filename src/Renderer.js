import marked from 'marked'

export default function render( tree ) {
  let rendered = ""

  tree.forEach( node => {
    if ( node ) {

      if ( node.type === "block" ) {
        const classes = node.arguments?.join(' ') ?? "";
        // console.log( classes )
        rendered += `<div class="${node.value}${ classes ? " " + classes : "" }">`

        if (node.children?.length) {
          rendered += render( node.children ) 
        }

        rendered += `</div>`
        
      } else if (node.type === "content") {
        rendered += marked(node.value)
      }

    }
  })

  return rendered;
}