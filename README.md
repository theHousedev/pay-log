# Pay Logging Site

This is 100% amateur hour so expect a big ole filetree filled with spaghetti

-# but hey, it's running and doing the job I want it to

**Frontend:** React + TSX using Shadcn components and a robbed colortheme

**Backend:** Go with a very novice understanding of HTTP serving

Selfhosted, Go will eventually spit out the Frontend in prod for me. For now, it's Vite in a tmux session piped to nginx.

## Goals
### Immediate
- [ ] Update totals display with changing pay period selection
- [ ] Flush form after submit/update actions
- [ ] Privacy mode for screenshots (to blank customer names)

### Near Term
- [ ] Popup/interactive inset for editing entries
- [ ] Pay validation features (also interactive? green/red pay comparison, data tracking)
- [ ] Update admin section to use minutes and align with new timetracking software at work

### Long Term
1. Graphical data (shadcn `charts`, perhaps)
2. localstorage-saved options connected to config menu
3. Reports/logs access via mobile/PC
