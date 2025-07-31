import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// === THEME COLORS ===
const COLOR_PRIMARY = "#1a73e8";
const COLOR_SECONDARY = "#e8eaed";
const COLOR_ACCENT = "#34a853";

/**
 * PUBLIC_INTERFACE
 * App is the main component for the Notes Application.
 * Production ready, minimalistic, light-themed, with header, sidebar nav, notes CRUD and search.
 */
function App() {
  // Notes: {id, title, content, created, updated}
  const [notes, setNotes] = useState(() =>
    JSON.parse(localStorage.getItem("notes") || "[]")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form handling
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    content: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const mainContentRef = useRef(null);

  // Persist notes to localStorage (simulate backend)
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Filter notes by search term (case insensitive in title/content)
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select note for viewing or editing
  function handleSelectNote(note) {
    setActiveNoteId(note.id);
    setFormState(note);
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  // Create new empty note
  function handleNewNote() {
    setActiveNoteId(null);
    setFormState({ id: "", title: "", content: "" });
    setIsEditing(true);
    if(mainContentRef.current) mainContentRef.current.scrollIntoView({behavior: "smooth"});
  }

  // PUBLIC_INTERFACE
  // Save a note (create or update)
  function handleSaveNote(e) {
    e.preventDefault();
    let updatedNotes;
    const timestamp = new Date().toISOString();
    if (formState.id) {
      // Edit
      updatedNotes = notes.map((note) =>
        note.id === formState.id
          ? { ...note, ...formState, updated: timestamp }
          : note
      );
    } else {
      // Create
      const id = Date.now().toString();
      updatedNotes = [
        ...notes,
        {
          ...formState,
          id,
          created: timestamp,
          updated: timestamp,
        },
      ];
    }
    setNotes(updatedNotes);
    setActiveNoteId(formState.id || updatedNotes[updatedNotes.length - 1].id);
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  // Edit an existing note
  function handleEditNote(note) {
    setActiveNoteId(note.id);
    setFormState(note);
    setIsEditing(true);
    if(mainContentRef.current) mainContentRef.current.scrollIntoView({behavior: "smooth"});
  }

  // PUBLIC_INTERFACE
  // Delete a note
  function handleDeleteNote(noteId) {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      const nextNotes = notes.filter((n) => n.id !== noteId);
      setNotes(nextNotes);
      setActiveNoteId(null);
      setFormState({ id: "", title: "", content: "" });
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  // Update form state for input fields
  function handleFormChange(e) {
    setFormState((fs) => ({ ...fs, [e.target.name]: e.target.value }));
  }

  // Keyboard shortcut: Ctrl+N for new note
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewNote();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line
  }, []);

  // Set accent/primary theme CSS vars on mount
  useEffect(() => {
    document.documentElement.style.setProperty("--notes-primary", COLOR_PRIMARY);
    document.documentElement.style.setProperty("--notes-secondary", COLOR_SECONDARY);
    document.documentElement.style.setProperty("--notes-accent", COLOR_ACCENT);
  }, []);

  // UI: Sidebar collapsed state (responsive)
  function toggleSidebar() {
    setSidebarOpen((o) => !o);
  }

  // Render: Sidebar list of notes
  function renderSidebar() {
    return (
      <nav className={`sidebar${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🗒️</span>
          <span className="sidebar-title">Notes</span>
        </div>
        <button className="sidebar-new-btn" onClick={handleNewNote} aria-label="New note">
          ＋ New
        </button>
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="search notes"
          />
        </div>
        <ul className="sidebar-list">
          {filteredNotes.length === 0 ? (
            <li className="sidebar-empty">No notes found.</li>
          ) : (
            filteredNotes
              .map((note) => (
                <li
                  key={note.id}
                  className={`sidebar-item${
                    note.id === activeNoteId ? " active" : ""
                  }`}
                  onClick={() => handleSelectNote(note)}
                  tabIndex={0}
                  aria-label={`note titled: ${note.title}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSelectNote(note);
                  }}
                >
                  <div className="note-title">{note.title || <span style={{fontStyle:'italic'}}>Untitled</span>}</div>
                  <div className="note-meta">
                    {new Date(note.updated).toLocaleDateString()}
                  </div>
                </li>
              ))
          )}
        </ul>
      </nav>
    );
  }

  // Render: Main content (note details, editor or welcome)
  function renderMainContent() {
    // NEW or EDIT
    if (isEditing) {
      return (
        <section className="main-content note-editor" ref={mainContentRef}>
          <h2>{formState.id ? "Edit Note" : "New Note"}</h2>
          <form onSubmit={handleSaveNote} autoComplete="off">
            <label>
              Title
              <input
                type="text"
                name="title"
                maxLength={100}
                value={formState.title}
                onChange={handleFormChange}
                required
                autoFocus
                placeholder="Note title"
              />
            </label>
            <label>
              Content
              <textarea
                name="content"
                maxLength={2000}
                value={formState.content}
                onChange={handleFormChange}
                rows={8}
                required
                placeholder="Write your note here…"
                style={{ resize: "vertical" }}
              />
            </label>
            <div className="editor-actions">
              <button type="submit" className="accent">
                {formState.id ? "Save Changes" : "Create Note"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setIsEditing(false);
                  if (formState.id) setActiveNoteId(formState.id);
                }}
              >
                Cancel
              </button>
              {formState.id && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDeleteNote(formState.id)}
                  aria-label="delete note"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </section>
      );
    }

    // Viewing a selected note
    if (activeNoteId) {
      const note = notes.find((n) => n.id === activeNoteId);
      if (!note)
        return (
          <section className="main-content" ref={mainContentRef}>
            <p>Note not found.</p>
          </section>
        );
      return (
        <section className="main-content note-detail" ref={mainContentRef}>
          <div className="note-detail-header">
            <h2>{note.title || <span style={{fontStyle:'italic'}}>Untitled</span>}</h2>
            <div>
              <button className="accent" onClick={() => handleEditNote(note)}>
                Edit
              </button>
              <button
                className="danger"
                onClick={() => handleDeleteNote(note.id)}
                aria-label="delete note"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="note-timestamp">
            {note.updated
              ? "Last updated: " +
                new Date(note.updated).toLocaleString()
              : ""}
          </div>
          <div className="note-detail-content">{note.content}</div>
        </section>
      );
    }

    // No note selected, show welcome
    return (
      <section className="main-content welcome" ref={mainContentRef}>
        <h2>Welcome to Notes</h2>
        <p>
          Select a note or <button className="accent" onClick={handleNewNote}>create a new note</button>.
        </p>
        {notes.length > 0 && (
          <p>
            <span style={{color:COLOR_ACCENT}}>Tip: </span> Use <kbd>Ctrl+N</kbd> to create a note.
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="notes-root">
      <header className="notes-header">
        <div className="header-title-bar">
          <span className="header-menu-toggle" onClick={toggleSidebar} title="Toggle Sidebar" aria-label="Toggle sidebar">
            ☰
          </span>
          <span className="header-title">
            <span style={{color: COLOR_PRIMARY, fontWeight:700, marginRight: 8}}>Simple</span>
            <span style={{color: COLOR_ACCENT, fontWeight:600}}>Notes</span>
          </span>
        </div>
        <span className="header-desc" style={{color: COLOR_PRIMARY}}>Fast, minimal & private</span>
      </header>
      <div className="notes-layout">
        {renderSidebar()}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
