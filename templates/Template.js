export class Template {
  constructor() {
    this.testFrameworks = {
      rspec: {
        color: 'red',
        name: 'Rspec'
      },
      junit: {
        color: 'green',
        name: 'JUnit'
      },
    };
    this.testFramework = null;
    this.formatter = (template, ...args) => {
      return template.replace(/@{([0-9]+)}/g, function (match, index) {
        return typeof args[index] === 'undefined' ? match : args[index];
      });
    };
  }

  header() {
    return `
    ## \$\${\\color{${this.testFramework.color}}${this.testFramework.name}}\$\$ Test results
    
    <table>
      <tr>
        <td> filepath </td>
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
    ## ${this.testFramework} Test Results
    
    <table>
      <tr>
        <td> filepath </td>
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
