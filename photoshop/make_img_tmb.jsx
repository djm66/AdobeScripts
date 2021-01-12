// make_img_tmb
// v1.0
// By Derek Morton
// Create a smaller version of image and a thumbnail in a folder.
// Will prompt user to select a folder. Images in the folder will be resized to a height of 600 and 100 pixels and saved with i and t suffixes.

filestoparse = Array("jpg");
//  filestoparse = Array("jpg", "jpeg", "gif");

// Save the unit type before forcing it to pixels
var RulerUnitType = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;

// Pops open a dialog for the user to choose the folder of documents to process
var startFolder = Folder.selectDialog("Select a folder of documents to process");
var folderlist = [];
if(startFolder == null)
{
    exit(0);
}

folderlist.push(startFolder);

ResizeImages();

// Restore the unit type
app.preferences.rulerUnits = RulerUnitType;

// Open Folder of Images
function ResizeImages()
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
    var filename;

    for (var i = 0; i < fileList.length; i++)
    {
        // Make sure all the files in the folder are compatible with PS
        if (fileList[i]instanceof File && !fileList[i].hidden && IsFileOneOfThese(fileList[i], filestoparse))
        {
            var nName = fileList[i].fullName;
            // ToDo Fix for other extensions
            //      filename = fileList[i].fullName.replace(".JPG", ".jpg");
            nName = fileList[i].fullName.replace(/\.[j|J][p|P][g|G]$/, "i.jpg");
            //      nName = filename.replace(/\.jpg$/, "i.jpg");

            ResizeImage(600, fileList[i], File(nName));
            nName = fileList[i].fullName.replace(/\.[j|J][p|P][g|G]$/, "t.jpg");
            //      nName = filename.replace(/\.jpg$/, "t.jpg");
            ResizeImage(100, fileList[i], File(nName));
        }
        else if (fileList[i]instanceof Folder && !fileList[i].hidden)
        {
            // Uncomment to parse sub dirs
            // folderlist.push(fileList[i]);
        }
    }
    return;
}

function ResizeImage(ImageHeight, oFile, nFile)
{
    fileopen = open(oFile);

    fileopen.resizeImage((fileopen.width * ImageHeight) / fileopen.height, ImageHeight, fileopen.resolution, ResampleMethod.BICUBICSHARPER);
    saveOptions = new JPEGSaveOptions();
    saveOptions.embedColorProfile = true;
    saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    saveOptions.matte = MatteType.NONE;
    saveOptions.quality = 9;
    fileopen.saveAs(nFile, saveOptions, false, Extension.LOWERCASE);
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