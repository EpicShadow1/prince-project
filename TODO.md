# Party Categories Implementation TODO

## Backend Changes
- [x] 1. Update database schema - Add party_category column to cases table
- [x] 2. Update database schema - Add contact_info JSON column to case_parties table
- [x] 3. Update Backend/src/routes/cases.js - Handle partyCategory in POST /cases
- [x] 4. Update Backend/src/routes/cases.js - Store contact_info for public parties

## Frontend API Changes
- [x] 5. Update src/services/api.ts - Add partyCategory to createCase type

## Frontend Context Changes
- [x] 6. Update src/contexts/CasesContext.tsx - Add partyCategory to Case interface
- [x] 7. Update src/contexts/CasesContext.tsx - Update addCase to pass party details

## Frontend UI Changes
- [x] 8. Update src/components/CreateCaseModal.tsx - Add imports (Building2, UserCircle)
- [x] 9. Update src/components/CreateCaseModal.tsx - Add PartyCategory type and state
- [x] 10. Update src/components/CreateCaseModal.tsx - Add plaintiffInfo/defendantInfo state
- [x] 11. Update src/components/CreateCaseModal.tsx - Add party category grid UI
- [x] 12. Update src/components/CreateCaseModal.tsx - Add conditional public party forms
- [x] 13. Update src/components/CreateCaseModal.tsx - Update validation logic
- [x] 14. Update src/components/CreateCaseModal.tsx - Update submit handler
