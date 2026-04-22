$status = git status --porcelain
$currentBranch = "main"

foreach ($line in $status) {
    if ($line -match '^([ MADRCU?]{2})\s+(.*)$') {
        $typeStr = $matches[1].Trim()
        $filePath = $matches[2].Trim()
        
        # Handle rename/copy paths (file1 -> file2)
        if ($filePath -match ' -> ') {
            $filePath = ($filePath -split ' -> ')[1]
        }

        $category = "changed"
        if ($typeStr -eq "??") {
            $category = "added"
        } elseif ($typeStr -eq "A") {
            $category = "added"
        } elseif ($typeStr -eq "D") {
            $category = "deleted"
        }

        # Sanitize filePath for branch name (remove spaces, dots, slashes)
        $cleanPath = $filePath -replace '[\\/ ]', '-' -replace '[^a-zA-Z0-9-]', ''
        $branchName = "$category/$cleanPath"
        
        Write-Host "Creating branch $branchName for $filePath ($typeStr)"
        
        # Ensure we are on main before creating branch
        git checkout $currentBranch
        
        # Create branch from main
        # If branch already exists, we might want to skip or overwrite. I'll use -B to overwrite if it exists.
        git checkout -B $branchName $currentBranch
        
        # Stage the file
        if ($typeStr -eq "D") {
            git rm --cached $filePath
        } else {
            git add $filePath
        }
        
        # Commit
        git commit -m "[$category] $filePath"
    }
}

# Finally go back to main
git checkout $currentBranch
