' Double-click this once to put a Camborder icon on your Desktop.
' The shortcut launches the popup directly via mshta.exe, so there's no
' console window flash, and it carries the Camborder icon.

Dim shell, fso, here, lnkPath, lnk

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

here = fso.GetParentFolderName(WScript.ScriptFullName)
lnkPath = shell.SpecialFolders("Desktop") & "\Camborder.lnk"

Set lnk = shell.CreateShortcut(lnkPath)
lnk.TargetPath = "mshta.exe"
lnk.Arguments = """" & here & "\launcher.hta"""
lnk.WorkingDirectory = here
lnk.IconLocation = here & "\camborder.ico"
lnk.Description = "Camborder - start the local overlay server"
lnk.Save

MsgBox "Done - ""Camborder"" is now on your Desktop." & vbCrLf & vbCrLf & _
       "Double-click it any time to open the start/stop panel.", _
       vbInformation, "Camborder"
