// stitchimages
// v1.0
// By Derek Morton
// Combine all images in a directory into a single image in the parent directory. Combined image will be named
// the same as the directory the images were in.
// Default image order is alphabetical. If adobe bridge has been used to sort the files into a different order, the
// .bridgesort file is used to determine order.
// Beware if the .bridgesort file is out of sync with the current directory, images not in the .bridgesort file
// will be ignored and images in the .bridgesort file that do not exist will generate a warning.

// File types to add
filestoparse = Array("jpg", "jpeg", "gif", "png", "jpf", "psd");

// Pops open a dialog for the user to choose the folder of images to process
var startFolder = Folder.selectDialog("Select a folder of documents to process");
var folderlist = [];
if(startFolder == null)
{
    exit(0);
}

folderlist.push(startFolder);

// Save the unit type before forcing it to pixels
var RulerUnitType = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;

// Open Folder of Images
var localdir = folderlist.pop();
while (localdir != null)
{
    OpenFolder(localdir);
    localdir = folderlist.pop();
}

// Restore the unit type
app.preferences.rulerUnits = RulerUnitType;

// Given the Folder of files, open them
function OpenFolder(inputFolder)
{
    var filesOpened = 0;
    var fileList = inputFolder.getFiles();
    var filesopen = [];
    var sx = 0;
    var sy = 0;

    // If there is a .bridgesort file, use that for the order
    var sortfile = File(inputFolder + "\/\.BridgeSort");
    if (sortfile.open("r:"))
    {
        var myline;
        var result;
        var fl = [];
        while (myline = sortfile.readln())
        {
            result = myline.match(/<item key='([^\.]*\....)/);
            if (result != null)
            {
                // Found a file entry, add a file object to the array
                fl.push(File(inputFolder + "\/" + result[1]));
            }
        }
        sortfile.close();
        // Add any folders in the current dir to the array so we can recurse
        for (var i = 0; i < fileList.length; i++)
        {
            if (fileList[i]instanceof Folder && !fileList[i].hidden)
            {
                fl.push(fileList[i]);
            }
        }
        // Overwrite the default file list with the ordered list.
        fileList = fl;
    }
    savetype = ".jpg"
    for (var i = 0; i < fileList.length; i++)
    {
        // Make sure all the files in the folder are compatible with PS
        if (fileList[i] instanceof File && !fileList[i].hidden && IsFileOneOfThese(fileList[i], filestoparse))
        {
            var e = fileList[i].error;

            // Check for errors (is it possible to get one here?)
            if (e == "")
            {
                // Check the file actually exists
                if (fileList[i].exists)
                {
                    // alert(fileList[i].fullName);
                    filesopen[filesOpened] = open(fileList[i]);
                    // alert(fileList[i].name);
                    if (fileList[i].name.split('.').pop() == "psd")
                    {
                        savetype = ".psd"
                    }
                    else if (fileList[i].name.split('.').pop() == "png")
                    {
                        savetype = ".png"
                    }
                    filesOpened++;
                    if (filesOpened > 1)
                    {
                        // Copy image content to clipboard
                        filesopen[1].selection.selectAll();
                        filesopen[1].selection.copy();

                        // Combined image file height may need to be increased to fit the new image
                        if (filesopen[1].height > filesopen[0].height)
                        {
                            sy = filesopen[1].height;
                        }
                        else
                        {
                            sy = filesopen[0].height;
                        }
                        sx = filesopen[0].width;

                        // Resize combined image to fit the new image
                        activeDocument = filesopen[0];
                        filesopen[0].resizeCanvas(filesopen[0].width + filesopen[1].width, sy, AnchorPosition.MIDDLELEFT);

                        // New image should be positioned in the centre vertically, so need half the difference in height.
                        sy = filesopen[0].height - filesopen[1].height;
                        if (sy > 0)
                        {
                            sy /= 2;
                        }

                        // Paste the new image into the combined image
                        var mysel = Array(
                            Array(sx, sy),
                            Array(sx, sy + filesopen[1].height),
                            Array(filesopen[0].width, sy + filesopen[1].height),
                            Array(filesopen[0].width, sy),
                            Array(sx, sy));
                        filesopen[0].selection.select(mysel);
                        filesopen[0].paste(true);

                        // Close the image
                        activeDocument = filesopen[1];
                        filesopen[1].close(SaveOptions.DONOTSAVECHANGES);
                        filesOpened--;
                    }
                }
                else
                {
                    alert(fileList[i].fullName + " does not exist, ignoring.");
                }
            }
            else
            {
                alert(e + " for " + fileList[i]);
            }
        }
        else if (fileList[i] instanceof Folder && !fileList[i].hidden)
        {
            folderlist.push(fileList[i]);
        }
    }
    if (filesOpened > 0)
    {
        // Save the combined image
        var dirname = inputFolder.absoluteURI;
        // Filename will be the same as the dirname
        var filename = dirname.match(/([\\\/][^\\\/]*)$/);
        if (filename[1] == null)
        {
            filename[1] = "\\temp";
        }

        // Change these options to save as a different file type
        var savefile = File(inputFolder.parent.absoluteURI + filename[1] + savetype);
        // alert(savefile);
        if (savetype == ".psd")
        {
            saveOptions = new PhotoshopSaveOptions();
            var layers = app.activeDocument.layers.length;
            var i;
            for (i = 0; i < layers; i++)
            {
                app.activeDocument.activeLayer = app.activeDocument.layers[i];
                selectLayerMask();
                deleteLayerMask();
            }
        }
        else if (savetype == ".png")
        {
            saveOptions = new PNGSaveOptions();
            if (app.activeDocument.layers.length > 1)
            {
                filesopen[0].mergeVisibleLayers();
            }
        }
        else
        {
            saveOptions = new JPEGSaveOptions();
            saveOptions.embedColorProfile = true;
            saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            saveOptions.matte = MatteType.NONE;
            saveOptions.quality = 8;
            filesopen[0].flatten();
        }
        //        alert (filename[1]);
        filesopen[0].saveAs(savefile, saveOptions, false, Extension.LOWERCASE);
        filesopen[0].close(SaveOptions.DONOTSAVECHANGES);
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
    //    alert(inFileName);
    return false;
}

function selectLayerMask()
{
    try
    {
        var id759 = charIDToTypeID("slct");
        var desc153 = new ActionDescriptor();
        var id760 = charIDToTypeID("null");
        var ref92 = new ActionReference();
        var id761 = charIDToTypeID("Chnl");
        var id762 = charIDToTypeID("Chnl");
        var id763 = charIDToTypeID("Msk ");
        ref92.putEnumerated(id761, id762, id763);
        desc153.putReference(id760, ref92);
        var id764 = charIDToTypeID("MkVs");
        desc153.putBoolean(id764, false);
        executeAction(id759, desc153, DialogModes.NO);
    }
    catch (e)
    { ; // do nothing
    }
}

function deleteLayerMask()
{
    try
    {
        var idDlt = charIDToTypeID("Dlt ");
        var desc6 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref5 = new ActionReference();
        var idChnl = charIDToTypeID("Chnl");
        var idOrdn = charIDToTypeID("Ordn");
        var idTrgt = charIDToTypeID("Trgt");
        ref5.putEnumerated(idChnl, idOrdn, idTrgt);
        desc6.putReference(idnull, ref5);
        executeAction(idDlt, desc6, DialogModes.NO);
    }
    catch (e)
    { ; // do nothing
    }
}
