class DefaultTemplate {
  constructor() {
    this.name = "DefaultTemplate";
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
          
          @{3}
          
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

  templateString() {
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
          
          @{3}
          
          \`\`\`
        
        </td>
      </tr>
    </table>
    `;
  }
}
