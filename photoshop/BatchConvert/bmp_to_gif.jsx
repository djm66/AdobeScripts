// bmp_to_gif
// v1.0
// By Derek Morton
// Convert all .bmp files in a folder to .gif

filestoparse = Array("bmp");

// Pops open a dialog for the user to choose the folder of documents to process
var startFolder = Folder.selectDialog("Select a folder of documents to process");
var folderlist = [];
folderlist.push(startFolder);

ProcessImages();

// Open Folder of Images
function ProcessImages()
{
    var localdir = folderlist.pop();
    while (localdir != null)
    {
        OpenFolder(localdir);
        localdir = folderlist.pop();
    }
}

// Given the Folder of files, open them
function OpenFolder(inputFolder)
{
    var fileList = inputFolder.getFiles();
    var fileopen;

    for (var i = 0; i < fileList.length; i++)
    {
        // Make sure all the files in the folder are compatible with PS
        if (fileList[i]instanceof File && !fileList[i].hidden && IsFileOneOfThese(fileList[i], filestoparse))
        {
            ModifyImage(fileList[i]);
        }
        else if (fileList[i]instanceof Folder && !fileList[i].hidden)
        {
            // Uncomment to parse sub dirs
            // folderlist.push(fileList[i]);
        }
    }
    return;
}

function ModifyImage(oFile)
{
    fileopen = open(oFile);

    var nName = oFile.fullName.replace(".bmp", ".jpg");

    var saveOptions = new GIFSaveOptions();
    saveOptions.colors = 256;
    saveOptions.dither = Dither.NONE;
    saveOptions.forced = ForcedColors.NONE;
    fileopen.saveAs(File(nName), saveOptions, false, Extension.LOWERCASE);
    fileopen.close(SaveOptions.DONOTSAVECHANGES);
}

// given a file name and a list of extensions
// determine if this file is in the list of extensions
function IsFileOneOfThese(inFileName, inArrayOfFileExtensions)
{
    var lastDot = inFileName.toString().lastIndexOf(".");
    if (lastDot == -1)
    {
        return false;
    }
    var strLength = inFileName.toString().length;
    var extension = inFileName.toString().substr(lastDot + 1, strLength - lastDot);
    extension = extension.toLowerCase();
    for (var i = 0; i < inArrayOfFileExtensions.length; i++)
    {
        if (extension == inArrayOfFileExtensions[i])
        {
            return true;
        }
    }
    return false;
}
