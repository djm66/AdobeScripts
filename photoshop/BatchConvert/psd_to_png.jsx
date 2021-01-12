// psd_to_png
// v1.0
// By Derek Morton
// Convert all .psd files in a folder to .png


// A list of file extensions to skip, keep them lower case
filestoparse = Array("psd");

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

// Open image file and save it as a png
function ModifyImage(oFile)
{
    fileopen = open(oFile);
    fileopen.changeMode(ChangeMode.RGB);
    fileopen.bitsPerChannel = BitsPerChannelType.EIGHT;
    if (fileopen.layers.length > 1)
    {
        fileopen.mergeVisibleLayers();
    }

    var nName = oFile.fullName.replace(".psd", ".png");

    var saveOptions = new PNGSaveOptions();
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
