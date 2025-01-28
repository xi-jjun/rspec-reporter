# Rspec Reporter action
This is rspec result reporter.<br>
You can easily report on your pull request comment only if rspec is failed.<br>

## ⚠︎ Prerequisites
You need to generate github token for using this actions. ([see GitHub Docs](https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#create-an-issue-comment))<br>
- “Issues” repository permissions (read & write)
- “Pull requests” repository permissions (read & write)

## Inputs
### `filepath`
- `filepath` is rspec result filepath.
- `REQUIRED`
- Your rspec result file must be in JSON format. Please generate the rspec result in JSON format.

### `test-framework`
- The framework used to execute tests. Please specify the test framework used.
- `REQUIRED`
- Currently, only `rspec`, `junit` are supported.

## Outputs
There is no output here.<br>

## Example usage
You should declare `permissions` if you want to use my action script.
```yaml
name: "Run Rails Rspec"
on:
  ...
jobs:
  run-rspec:
    runs-on: ubuntu-latest

    services:
      ...

    # Add this permission to allow the role to comment on pull requests.
    permissions:
      issues: write
      pull-requests: write
    ...

    steps:
      - name: ...
      
      # Run rspec and output the results in a JSON file. (Only JSON format is valid)
      - name: Run rspec and make rspec_result.json file
        run: |
          mkdir -p tmp
          bundle exec rspec . --format j --out tmp/rspec_result.json

      - name: Add rspec failure result on Pull Request comment
        if: failure() # Generate a report in pull request comment when rspec is failed.
        uses: xi-jjun/rspec-reporter@v2.0.0
        with:
          filepath: 'tmp/rspec_result.json'
          test-framework: 'rspec'
        env:
          # Set the GitHub token that you generated earlier.
          GITHUB_TOKEN: ${{ secrets.CREATE_ISSUE_GITHUB_TOKEN }} 
```

For JUnit test framework
```yaml
name: "Run JUnit test"
  ...
    # Github actions permissions (PR comment에 테스트 결과 리포팅을 위해 필수)
    permissions:
      issues: write
      pull-requests: write
      
      ...

      - name: test marketplace
        if: failure()
        uses: xi-jjun/rspec-reporter@v2.0.0
        with:
          filepath: './spring-junit/build/test-results/cases' # test result file dir
          test-framework: 'junit'
        env:
          GITHUB_TOKEN: ${{ secrets.CREATE_ISSUE_GITHUB_TOKEN }}
```
