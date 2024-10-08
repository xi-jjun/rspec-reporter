export class Template {
  constructor() {
    this.formatter = (template, ...args) => {
      return template.replace(/@{([0-9]+)}/g, function (match, index) {
        return typeof args[index] === 'undefined' ? match : args[index];
      });
    };
  }

  header() {
    return `
    ## Rspec Test Results
    
    <table>
      <tr>
        <td> rspec filepath </td>
        <td> full description </td>
        <td> detail error message </td>
      </tr>
    `;
  }

  body() {
    return `
      <tr>
        <td> @{0} </td>
        <td> @{1} </td>
        <td>
        
          \`\`\`console
          
          @{2}
          
          \`\`\`
        
        </td>
      </tr>
    `;
  }

  footer() {
    return `
    </table>
    `;
  }

  fullTemplate() {
    return `
    ## Rspec Test Results
    
    <table>
      <tr>
        <td> rspec filepath </td>
        <td> full description </td>
        <td> detail error message </td>
      </tr>
      <tr>
        <td> @{0} </td>
        <td> @{1} </td>
        <td>
        
          \`\`\`console
          
          @{2}
          
          \`\`\`
        
        </td>
      </tr>
    </table>
    `;
  }
}
