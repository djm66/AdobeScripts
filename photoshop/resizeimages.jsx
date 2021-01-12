// resizeimages
// v1.0
// By Derek Morton
// Resize all images in the selected folder to a given height.
// Will prompt user to select a folder then specify a height

filestoparse = Array("jpg", "jpeg", "gif");

// Pops open a dialog for the user to choose the folder of documents to process
var startFolder = Folder.selectDialog("Select a folder of documents to process");
var folderlist = [];
if(startFolder == null)
{
    exit(0);
}

folderlist.push(startFolder);

// Pops open a dialog for the user to select output size
ShowDialog()

// Dialog to select output image size
function ShowDialog()
{
    var dlg = new Window('dialog', 'Select Height', [100, 100, 480, 245]);
    dlg.msgPnl = dlg.add('panel', [25, 15, 355, 130]);
    dlg.msgPnl.HeightSt = dlg.msgPnl.add('statictext', [15, 15, 105, 35], 'Height');
    dlg.msgPnl.Height = dlg.msgPnl.add('edittext', [15, 40, 105, 60], '600');
    dlg.msgPnl.testBtn = dlg.msgPnl.add('button', [15, 65, 105, 85], 'Ok',
        {
            name: 'ok'
        }
        );
    dlg.show();
    ResizeImages(parseInt(dlg.msgPnl.Height.text));
}

// Open Folder of Images
function ResizeImages(ImageHeight)
{
    var localdir = folderlist.pop();
    while (localdir != null)
    {
        OpenFolder(localdir, ImageHeight);
        localdir = folderlist.pop();
    }
}

// Given the Folder of files, open them
function OpenFolder(inputFolder, ImageHeight)
{
    var fileList = inputFolder.getFiles();
    var fileopen;

    for (var i = 0; i < fileList.length; i++)
    {
        // Make sure all the files in the folder are compatible with PS
        if (fileList[i]instanceof File && !fileList[i].hidden && IsFileOneOfThese(fileList[i], filestoparse))
        {
            fileopen = open(fileList[i]);

            fileopen.resizeImage((fileopen.width * ImageHeight) / fileopen.height, ImageHeight, fileopen.resolution, ResampleMethod.BICUBICSHARPER);
            saveOptions = new JPEGSaveOptions();
            saveOptions.embedColorProfile = true;
            saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            saveOptions.matte = MatteType.NONE;
            saveOptions.quality = 9;
            fileopen.saveAs(fileList[i], saveOptions, false, Extension.LOWERCASE);
            fileopen.close(SaveOptions.DONOTSAVECHANGES);
        }
        else if (fileList[i]instanceof Folder && !fileList[i].hidden)
        {
            // Uncomment to parse sub dirs
            //      folderlist.push(fileList[i]);
        }
    }
    return;
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
