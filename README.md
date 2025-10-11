# Pay Logging Site

> *This is 100% amateur hour so expect a big ole filetree filled with spaghetti*  
> <sub>...but hey, it's running and doing the job I want it to</sub>

## Tech Stack

- **Frontend:** React + TypeScript + Vite
  - UI: Shadcn components with custom theme
  - Styling: Tailwind CSS
  
- **Backend:** Go
  - Database: SQLite
  - Authentication: Session-based with cookies (rev 1)
  
- **Deployment:** Self-hosted
  - Dev: Vite dev server → nginx proxy
  - Prod: Go static server (planned)

---

## Roadmap

### Immediate
- [x] ~~Update totals display with changing pay period selection~~
  - *Partial: hour breakdown pending*
- On submit or update:
  - [ ] Flush form out to empty
  - [ ] Refresh data display
- [ ] Privacy mode for screenshots (blank customer names)

### Near Term
- [ ] Popup/interactive modal for editing entries
- [ ] Pay validation features
  - Green/red pay comparison
  - Actual vs. expected tracking
- [ ] Admin time tracking: switch to minutes for work software alignment

### Long Term
- [ ] Data visualizations (Shadcn charts)
- [ ] LocalStorage-based user preferences + config menu
- [ ] Mobile-optimized reports/logs view
