describe('Sticky CTA behavior', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('przycisk pojawia się po scroll >200px i znika gdy wrócimy', () => {
    cy.get('#stickyBtn').should('not.be.visible');
    cy.scrollTo(0, 300);
    cy.get('#stickyBtn').should('be.visible');
    cy.scrollTo(0, 0);
    cy.get('#stickyBtn').should('not.be.visible');
  });
});