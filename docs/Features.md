# Features für Taktikboard-COD

[Notieren und beschreiben Sie hier alle wesentlichen Funktionen bzw. *Features* Ihrer Anwendung. Seien Sie möglichst ausführlich in der Dokumentation und beachten Sie für die Erläuterungen ("Beschreibung") die Perspektive Ihrer NutzerInnen. Schätzen Sie initial den wahrscheinlichen Aufwand - auch um diese Schätzung am Ende des Projekts mit dem tatsächlichen Aufwand vergleichen zu können. Priorisieren Sie die Features hinsichtlich des zentralen *Use Case* Ihrer Anwendung und notieren Sie, welche größeren Bereiche der Anwendung von diesen Funktionen betroffen sind]

| Feature | Beschreibung | Priorität | Geschätzter Aufwand | Betroffene Schichten |
|---------|--------------|-----------|--------------------|---------------------|
| **Zeichenfunktion** | Pinsel Funktion mit verschiedenen Farben | kritisch | 3 Tage | Taktikeditor |
| **Drag & Drop von Objekten** | Alle nötigen Spielelemente sind auch in Form von Icons mit Hilfe von Drag and Drop auf der Map platzierbar | medium | 2 Tage | Toolbar im Dashboard |
| **Tokens (Vorgefertigte Icons)** | Vorgefertigte Spielelemente können in Form von Icons mit als Tokens auf der Taktiktafel platziert werden. | kritisch | 2 Tage | Dashboard / Map |
| **Zeitangabe** |  | kritisch | |  |
| **Aktive User anzeigen** | Alle aktiven User werden im Dashboard angezeigt | nice-to-have | 2 Tage | Dashboard |
| **Lobbysystem** | Die User können sich in einer privaten Lobby treffen (ggf. per Link) | hoch | 3 Tage | Dashboard |
| **Radierfunktion** | Die eingezeichneten Spielerbewegungen können mit dem Radiergummitool gelöscht werden. Außerdem gibt es die Möglichkeit alle bisherigen Markierungen zu löschen | hoch | 2 Tage | Taktikeditor |
| **Zoomfunktion auf Map** | Mit Hilfe des Mausrads kann in die gewählte Map gezoomt werden | nice-to-have | 1 Tag | Dashboard / Canvas |
| **Map-Archiv** | Den Benutzern wird eine Auswahl an Maps gestellt die über ein Dropdown-Menü gewählt werden können | hoch | 1 Tag | Hauptnavigation über Canvas |
| **Undo-Redo** | Die eingezeichneten Spielerbewegungen und können rückgängig gemacht werden oder wiederhergestellt werden | hoch | 2 Tag | Hauptnavigation über Taktikeditor 
| **Timeline-Funktion** | Einzelne Spielstände können mit Timecode als "Stand" gespeichert werden gff. kann durch Spielstände navigiert werden | hoch | 2 Tage | Hauptnavigation unter Taktikeditor 

## Umsetzung

Ein E-Sport Team trifft sich auf der Landingpage der Anwendung. Dort kann ein Link generiert werden mit dem sich das Team in einer privaten Lobby treffen kann. Mit Hilfe der Dropdown-Auswahl kann die Map des nächsten Matches ausgewählt werden. Nun können die Spieler die einzelnen Bewegungen und Spielzüge einzeichnen. Spezielle Spielevents wie Utlitiy-Einsatz kann mit dem Tokens oder der Quickselect Icons in der Toolbar des Taktikeditors in der Map platziert werden. Falls sich das Team uneinig ist, können die letzten Spielzüge mit der Undo-Funktion wieder rückgängig gemacht werden.  

## Reihenfolge

1. 
  - Das Lobbysystem und der Canvas mit Bilder-Upload/Zoom Funktion entwickelt und implementieren 
  - Die aktiven Nutzer sollten hier bereits angezeigt werden  
2. 
  - Die interaktiven Hauptfunktionen der Anwendung:
    a) Zeichnen per Pinsel (verschiedenen Farben, Pinselgröße, etc.)
    b) Wählen und Einfügen von Tokens mit Drag & Drop
    c) Radiergummi-Tool
  - Parallel dazu muss auch die Undo/Redo Funktion implementiert werden
3.
  - Map Archiv (ähnelt grundsätzlich dem Bilder-Upload)  
