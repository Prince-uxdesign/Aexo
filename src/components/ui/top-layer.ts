/**
 * Fired by <Dialog> whenever a modal opens or closes.
 *
 * While a modal is open the browser makes everything outside it inert, so a
 * toast there could cover the dialog's buttons without being dismissable or
 * announced. The toast region listens for this and holds toasts until the modal
 * closes.
 */
export const MODAL_CHANGE = "aexo:modal-change";

export function announceModalChange() {
  document.dispatchEvent(new Event(MODAL_CHANGE));
}

export function isModalOpen() {
  return Boolean(document.querySelector("dialog:modal"));
}
