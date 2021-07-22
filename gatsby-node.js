/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path')
const componentWithMDXScope = require('gatsby-mdx/component-with-mdx-scope')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const {returnMFConfig} = require('federation-exposes-plugin')
const { dependencies } = require(path.resolve('./', 'package.json'))

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMdx {
              edges {
                node {
                  id
                  frontmatter {
                    name
                    menu
                    title
                  }
                  parent {
                    ... on File {
                      name
                      sourceInstanceName
                    }
                  }
                  code {
                    scope
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }
        // Create blog posts pages.
        result.data.allMdx.edges.forEach(async ({ node }) => {
          createPage({
            path: `/${node.frontmatter.menu.toLowerCase()}/${node.parent.name.toLowerCase()}`,
            component: componentWithMDXScope(
              path.resolve('./src/templates/posts.js'),
              node.code.scope
            ),
            context: {
              id: node.id,
              name: node.frontmatter.name,
            },
          })
        })
      })
    )
  })
}

// exports.onCreateWebpackConfig = ({
//   stage,
//   rules,
//   loaders,
//   plugins,
//   actions,
// }) => {
//   actions.setWebpackConfig({
//     plugins: [
//       // plugins.define({
//       //   __DEV__: stage === `develop` || stage === `develop-html`,
//       // }),
//       new ModuleFederationPlugin(
//         returnMFConfig({
//           name: 'ge_components', // this will be used by the consuming federation host
//           exposesOpts: {
//             // paths to the components
//             paths: ['./src/components/**/*.{t,j}s{,x}'],
//             exclude: /\.?test\./,
//             removePrefix: './src/components'
//           },
//           shared: {
//             ...dependencies
//           }
//         })
//       )
//     ],
//   })
// }