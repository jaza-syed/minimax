local repo_root = vim.fs.dirname(debug.getinfo(1, "S").source:sub(2))

dofile(vim.fs.joinpath(repo_root, ".local", "init.lua"))
